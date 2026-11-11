import { jsPDF } from 'jspdf'
import { pdfFont, registerFonts } from './pdfFonts'

/*
 * PDF of a document of the site drawn directly, without the print window: the page laid out by the browser (the same template
 * as the preview) is read, then drawn into an A4 PDF with jsPDF: the ink on the whole page, the grounds, rules and marks,
 * the logo, every word at its place in the font of the site (real text: selectable, searchable), the links.
 *   const pdf = await renderPdf(root)    root: the sheet (.billing-document / .contract-container), laid out 794 px wide
 * Pages: 12 mm free at the top and bottom of each one; a block that must stay whole (a row, a part, the signature) starts the
 * next page instead of being cut; a long text goes on line after line.
 */
const PAGE_W = 794
const PAGE_H = 1123
const SPACE = 45
const INK: [number, number, number] = [17, 20, 23]
// Blocks never cut in two: a block that does not fit starts the next page
const WHOLE = 'tr, li, .bd-parties, .bd-totals, .bd-net, .bd-block, .bd-sign, .section, .payment-details, .payment-option-selected, .payment-option-alternative, .bank-transfer-option, .automatic-debit-section, .signature-section, .signature-block, h1, h2, h3, h4'

// A color [red, green, blue, opacity]
type Rgba = [number, number, number, number]
// A place on the sheet, in pixels
type Box = { x: number, y: number, w: number, h: number }
// Something to draw: a ground, a word, an image or a link
type Item = Box & (
    | { type: 'rect', fill: Rgba, alpha: number, round?: boolean }
    | { type: 'text', text: string, font: string, size: number, spacing: number, fill: Rgba, alpha: number, base: number, angle: number, center?: boolean }
    | { type: 'image', el: HTMLImageElement, alpha: number }
    | { type: 'link', url: string }
)

// "rgba(126, 230, 168, 0.5)" -> [126, 230, 168, 0.5]
const color = (value: unknown): Rgba | null => {
    const m = String(value).match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const [r = 0, g = 0, b = 0, a = 1] = (m[1] ?? '').split(/[,\s/]+/).filter(Boolean).map(Number)
    return a > 0 ? [r, g, b, a] : null
}
const px = (value: string) => parseFloat(value) || 0

// Distance from the top of a line box of text to its baseline, for each font (measured once in the frame)
const baselines: Record<string, number> = {}
const baselineOf = (doc: Document, style: CSSStyleDeclaration, font: string): number => {
    if (baselines[font] !== undefined) return baselines[font]
    const probe = doc.createElement('span')
    probe.style.cssText = `position:absolute;left:0;top:0;white-space:nowrap;font-family:${style.fontFamily};font-weight:${style.fontWeight};font-stretch:${style.fontStretch};font-size:100px;line-height:normal`
    probe.textContent = 'Hxg'
    const mark = doc.createElement('span')
    mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
    probe.appendChild(mark)
    doc.body.appendChild(probe)
    const range = doc.createRange()
    range.selectNodeContents(probe.firstChild!)
    baselines[font] = (mark.getBoundingClientRect().top - range.getBoundingClientRect().top) / 100
    probe.remove()
    return baselines[font]
}

// Angle of a rotation of an element (the draft word): degrees
const angleOf = (transform: string) => {
    const m = String(transform).match(/matrix\(([^)]+)\)/)
    if (!m) return 0
    const [a = 1, b = 0] = (m[1] ?? '').split(',').map(Number)
    return Math.round(Math.atan2(b, a) * 180 / Math.PI)
}

// Everything to draw, read from the page laid out by the browser, in the order of the page (later items over earlier ones)
const collect = (root: HTMLElement) => {
    const doc = root.ownerDocument
    const origin = root.getBoundingClientRect()
    const items: Item[] = []
    const box = (r: DOMRect): Box => ({ x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height })

    const ground = (r: Box, style: CSSStyleDeclaration, alpha: number) => {
        const fill = color(style.backgroundColor)
        const round = px(style.borderTopLeftRadius) >= Math.min(r.w, r.h) / 2 - 0.5 && r.w > 0
        if (fill) items.push({ type: 'rect', ...r, fill, alpha: alpha * fill[3], round })
        const sides: [string, (w: number) => Box][] = [['Top', (w: number) => ({ ...r, h: w })], ['Bottom', (w: number) => ({ ...r, y: r.y + r.h - w, h: w })],
            ['Left', (w: number) => ({ ...r, w })], ['Right', (w: number) => ({ ...r, x: r.x + r.w - w, w })]]
        const css = style as unknown as Record<string, string>
        for (const [side, strip] of sides) {
            const width = px(css[`border${side}Width`] ?? '')
            const line = width && css[`border${side}Style`] !== 'none' ? color(css[`border${side}Color`]) : null
            if (line) items.push({ type: 'rect', ...strip(width), fill: line, alpha: alpha * line[3] })
        }
        // A mark drawn by an inset shadow on the left (the row of the net to pay...)
        const shadow = String(style.boxShadow).match(/(rgba?\([^)]+\))\s+(\d+(?:\.\d+)?)px\s+0px\s+0px(?:\s+0px)?\s+inset/)
        const mark = shadow ? color(shadow[1]) : null
        if (shadow && mark) items.push({ type: 'rect', ...r, w: Number(shadow[2]), fill: mark, alpha })
    }

    const text = (node: Text, style: CSSStyleDeclaration, alpha: number, angle = 0) => {
        const content = node.textContent ?? ''
        if (!content.trim()) return
        const fill = color(style.color)
        if (!fill) return
        const font = pdfFont(style)
        const size = px(style.fontSize)
        const spacing = style.letterSpacing === 'normal' ? 0 : px(style.letterSpacing)
        const upper = style.textTransform === 'uppercase'
        const range = doc.createRange()
        const base = baselineOf(doc, style, font) * size
        const push = (piece: string, r: DOMRect) => items.push({ type: 'text', ...box(r), text: upper ? piece.toUpperCase() : piece, font, size, spacing, fill,
            alpha: alpha * fill[3], base, angle })
        for (const word of content.matchAll(/\S+/g)) {
            const index = word.index ?? 0
            range.setStart(node, index)
            range.setEnd(node, index + word[0].length)
            const rects = [...range.getClientRects()].filter(r => r.width)
            if (!rects.length) continue
            if (rects.length === 1) { push(word[0], rects[0]!); continue }
            // A word cut over several lines (a long link): each piece on its own line, where the page shows it
            let piece = '', start = 0, line: DOMRect | null = null
            for (let i = 0; i < word[0].length; i++) {
                range.setStart(node, index + i)
                range.setEnd(node, index + i + 1)
                const r = range.getClientRects()[0]
                if (!r) continue
                if (line && Math.abs(r.top - line.top) > 1) {
                    range.setStart(node, index + start); range.setEnd(node, index + i)
                    push(piece, range.getClientRects()[0] || line)
                    piece = ''; start = i
                }
                if (!piece) line = r
                piece += word[0][i]
            }
            range.setStart(node, index + start); range.setEnd(node, index + word[0].length)
            if (piece && (range.getClientRects()[0] || line)) push(piece, (range.getClientRects()[0] || line)!)
        }
    }

    // A ::before / ::after: its ground (cards of the parties, dots, small dashes) or its word (the draft mark)
    const pseudo = (el: Element, r: Box, which: string, alpha: number) => {
        const style = getComputedStyle(el, which)
        if (!style.content || style.content === 'none' || style.content === 'normal' || style.display === 'none') return
        // A place in % is a share of the element (the draft word: 50 % across, 42 % down)
        // (a share of one page at least, as the sheet of the preview, which is never shorter than a page)
        const along = (value: string, size: number) => String(value).endsWith('%') ? parseFloat(value) / 100 * size : px(value)
        const tall = el === root ? Math.max(r.h, PAGE_H - 2 * SPACE) : r.h
        const w = along(style.width, r.w), h = along(style.height, tall)
        const left = style.left !== 'auto' ? along(style.left, r.w) : style.right !== 'auto' ? r.w - along(style.right, r.w) - w : 0
        const top = style.top !== 'auto' ? along(style.top, tall) : style.bottom !== 'auto' ? tall - along(style.bottom, tall) - h : 0
        const at = { x: r.x + left, y: r.y + top, w, h }
        ground(at, style, alpha * (Number(style.opacity) || 1))
        const word = style.content.replace(/^["']|["']$/g, '')
        const fill = color(style.color)
        if (word.trim() && fill) {
            const font = pdfFont(style)
            const size = px(style.fontSize)
            const angle = angleOf(style.transform)
            // A turned word (centered on its place by its own translate(-50%, -50%)): drawn turned around that place
            items.push({ type: 'text', x: at.x, y: at.y, w, h, text: word.trim(), font, size, spacing: 0, fill,
                alpha: alpha * fill[3], base: angle ? 0 : baselineOf(el.ownerDocument, style, font) * size, angle, center: Boolean(angle) })
        }
    }

    const walk = (el: Element, alpha: number) => {
        const style = getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden') return
        const own = alpha * (Number(style.opacity) || 1)
        const r = box(el.getBoundingClientRect())
        ground(r, style, own)
        const behind = (which: string) => Number(getComputedStyle(el, which).zIndex) < 0
        if (behind('::before')) pseudo(el, r, '::before', own)
        if (behind('::after')) pseudo(el, r, '::after', own)
        if (!behind('::before')) pseudo(el, r, '::before', own)
        if (el instanceof HTMLImageElement && el.complete && el.naturalWidth) items.push({ type: 'image', ...r, el, alpha: own })
        if (el instanceof HTMLAnchorElement && el.href && !el.href.startsWith('javascript')) items.push({ type: 'link', ...r, url: el.href })
        for (const child of el.childNodes) {
            if (child instanceof Element) walk(child, own)
            else if (child instanceof Text) text(child, style, own)
        }
        if (!behind('::after')) pseudo(el, r, '::after', own)
    }
    walk(root, 1)

    const whole = [...root.querySelectorAll(WHOLE)].map(el => box(el.getBoundingClientRect())).filter(b => b.h > 0)
    return { items, whole, height: root.getBoundingClientRect().height }
}

// Where each page starts on the sheet: a block that does not fit starts the next page, a long text breaks between lines
const paginate = (items: Item[], whole: Box[]) => {
    const room = PAGE_H - 2 * SPACE
    const tops = [0]
    const marks = [
        ...whole.map(b => ({ top: b.y, bottom: b.y + b.h, block: true })),
        ...items.filter(i => i.type === 'text' && !i.center).map(i => ({ top: i.y, bottom: i.y + i.h, block: false })),
    ].sort((a, b) => a.top - b.top || Number(b.block) - Number(a.block))
    for (const mark of marks) {
        const start = tops[tops.length - 1] ?? 0
        if (mark.bottom - start <= room || mark.top <= start) continue
        if (mark.block && mark.bottom - mark.top > room) continue
        tops.push(mark.top)
    }
    return tops
}

const imageData = (el: HTMLImageElement) => {
    const canvas = el.ownerDocument.createElement('canvas')
    canvas.width = el.naturalWidth
    canvas.height = el.naturalHeight
    canvas.getContext('2d')?.drawImage(el, 0, 0)
    return canvas.toDataURL('image/png')
}

/** The A4 PDF of a sheet laid out in the page (see the top of this file). */
export const renderPdf = async (root: HTMLElement) => {
    const pdf = new jsPDF({ unit: 'px', format: [PAGE_W, PAGE_H], hotfixes: ['px_scaling'], compress: true })
    await registerFonts(pdf)
    drawSheet(pdf, root, 0)
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }))
    return pdf
}

// Draws the pages of a sheet after the first `before` pages of the PDF; returns the number of pages then
const drawSheet = (pdf: jsPDF, root: HTMLElement, before: number) => {
    const { items, whole } = collect(root)
    const tops = paginate(items, whole)
    tops.forEach((_, i) => {
        if (before + i) pdf.addPage([PAGE_W, PAGE_H])
        pdf.setPage(before + i + 1)
        pdf.setFillColor(...INK)
        pdf.rect(0, 0, PAGE_W, PAGE_H, 'F')
    })
    const pageOf = (y: number) => tops.reduce((p, top, i) => (y >= top - 0.5 ? i : p), 0)
    const opacity = (alpha: number) => pdf.setGState(new (pdf as any).GState({ opacity: Math.min(1, Math.max(0, alpha)) }))
    const images = new Map<string, string>()

    for (const item of items) {
        if (item.type === 'rect') {
            // A ground over several pages: its part on each page
            for (let p = pageOf(item.y); p < tops.length && tops[p]! < item.y + item.h; p++) {
                const top = tops[p]!
                const from = Math.max(item.y, top), to = Math.min(item.y + item.h, tops[p + 1] ?? Infinity, top + PAGE_H - 2 * SPACE)
                if (to <= from) continue
                pdf.setPage(before + p + 1)
                opacity(item.alpha)
                pdf.setFillColor(item.fill[0], item.fill[1], item.fill[2])
                const y = from - top + SPACE
                if (item.round) pdf.ellipse(item.x + item.w / 2, y + (to - from) / 2, item.w / 2, (to - from) / 2, 'F')
                else pdf.rect(item.x, y, item.w, to - from, 'F')
            }
            continue
        }
        const p = pageOf(item.y)
        pdf.setPage(before + p + 1)
        const y = item.y - (tops[p] ?? 0) + SPACE
        if (item.type === 'text') {
            opacity(item.alpha)
            pdf.setFont(item.font, 'normal')
            pdf.setFontSize(item.size * 0.75)
            pdf.setTextColor(item.fill[0], item.fill[1], item.fill[2])
            // Each word exactly as wide as in the page: the small differences of the fonts never make two words touch
            const letters = [...item.text].length
            const natural = pdf.getTextWidth(item.text) + item.spacing * letters
            const fit = item.center || !letters ? item.spacing : item.spacing + (item.w - natural) / letters
            if (item.center) {
                // A turned word centered on its place: its start found back along its angle (jsPDF does not center turned text),
                // its baseline a third of its size under the middle
                const turn = -item.angle * Math.PI / 180
                const half = natural / 2, drop = item.size * 0.35
                const x = item.x - half * Math.cos(turn) + drop * Math.sin(turn)
                const yy = y + half * Math.sin(turn) + drop * Math.cos(turn)
                pdf.text(item.text, x, yy, { charSpace: item.spacing, angle: -item.angle, baseline: 'alphabetic' })
            } else pdf.text(item.text, item.x, y + item.base, { charSpace: fit, baseline: 'alphabetic' })
        } else if (item.type === 'image') {
            if (!images.has(item.el.src)) images.set(item.el.src, imageData(item.el))
            opacity(item.alpha)
            pdf.addImage(images.get(item.el.src)!, 'PNG', item.x, y, item.w, item.h)
        } else if (item.type === 'link') pdf.link(item.x, y, item.w, item.h, { url: item.url })
    }
    return before + tops.length
}
