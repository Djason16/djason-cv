import { createApp, nextTick, type Component } from 'vue'

/*
 * PDF of a quote, invoice or contract, downloaded at once (no print window): real text (it can be selected and searched),
 * the fonts of the site, the ink of the site on every page to the edges.
 *   1. the Vue template (components/views/Documents) is mounted in a hidden frame, with the styles of the site,
 *      laid out as one A4 column (the pages are cut by the drawing)
 *   2. that sheet is drawn into an A4 PDF (utils/pdfRender.js) and saved as <number>.pdf
 *
 *   await exportPdf({ component: BillingDocument, props: {...}, fileName: 'DE-2026-0001' })
 *   const base64 = await exportPdf({ ..., output: 'base64' })     the same file, not saved: sent by email (useDocumentMail)
 */

// The sheet as one A4 column: no ground of its own (the PDF draws the ink on each page), no room above and under it
// (each page of the PDF has its own), never shorter or longer than its content
const LAYOUT_CSS = `
    html, body { margin: 0; padding: 0; background: #111417; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
    .billing-document, .contract-container {
        background: transparent !important;
        width: 210mm !important;
        min-height: 0 !important;
        margin: 0 !important;
        zoom: 1 !important;
        box-shadow: none !important;
    }
    .billing-document { padding-top: 0 !important; padding-bottom: 0 !important; }
    .contract-container .content { padding-top: 0 !important; padding-bottom: 0 !important; }
`

// Every image of the frame loaded (the logo), or failed
const imagesLoaded = (doc: Document) => Promise.all([...doc.images].map(img => img.complete ? null : new Promise(done => { img.onload = img.onerror = done })))

// Every font of the site loaded in the frame before anything is measured: a browser loads a font only when it first draws it,
// and a word measured in a fallback font, then drawn in the font of the site, would be out of place
const fontsLoaded = async (doc: Document) => {
    await Promise.allSettled([...doc.fonts].map(face => face.load()))
    await doc.fonts.ready
    // Two frames: the page laid out again with the fonts loaded
    await new Promise(done => doc.defaultView?.requestAnimationFrame(() => doc.defaultView?.requestAnimationFrame(done)))
}

export const exportPdf = async ({ component, props, fileName, output = 'save' }: { component: Component, props: Record<string, unknown>, fileName: string, output?: 'save' | 'base64' }) => {
    if (import.meta.server) return

    // An A4 frame out of sight, with the styles of the site and the layout above
    const frame = document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.style.cssText = 'position: fixed; left: -300mm; top: 0; width: 210mm; height: 297mm; border: 0; visibility: hidden; pointer-events: none;'
    document.body.appendChild(frame)
    const doc = frame.contentDocument!
    doc.open()
    doc.write('<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body></body></html>')
    doc.close()
    // The styles of the site: a stylesheet given as a link loads later, it is waited for before anything is measured
    const sheets: Promise<unknown>[] = []
    for (const node of document.querySelectorAll('style, link[rel="stylesheet"]')) {
        const copy = node.cloneNode(true)
        if (copy instanceof HTMLLinkElement) sheets.push(new Promise(done => { copy.onload = copy.onerror = done }))
        doc.head.appendChild(copy)
    }
    const style = doc.createElement('style')
    style.textContent = LAYOUT_CSS
    doc.head.appendChild(style)

    const place = doc.createElement('div')
    doc.body.appendChild(place)
    const app = createApp(component, props)
    app.mount(place)
    try {
        await Promise.all(sheets)
        await nextTick()
        await fontsLoaded(doc)
        await imagesLoaded(doc)
        const { renderPdf } = await import('./pdfRender')
        const pdf = await renderPdf(doc.querySelector<HTMLElement>('.billing-document, .contract-container')!)
        if (output === 'base64') return pdf.output('datauristring').split(',')[1]
        pdf.save(`${fileName}.pdf`)
    } finally {
        app.unmount()
        frame.remove()
    }
}
