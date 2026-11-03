/*
 * Fonts of the PDF made in the browser (utils/pdfRender.js): the fonts of the site as TrueType files (public/fonts/),
 * embedded in the PDF so its text is real text (selectable, searchable) in the font of the site.
 *   await registerFonts(pdf)          loads them once, adds them to a jsPDF document
 *   pdfFont(style)                    the name of the PDF font for a computed style of the page (family + weight)
 */
const FILES = {
    barlow400: 'BarlowCondensed-Regular.ttf',
    barlow500: 'BarlowCondensed-Medium.ttf',
    barlow600: 'BarlowCondensed-SemiBold.ttf',
    archivo600: 'Archivo-Expanded-SemiBold.ttf',
}

// Base64 of every font file, loaded once per visit
let loaded = null
const toBase64 = buffer => {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    return btoa(binary)
}
const loadFiles = () => loaded ??= Promise.all(Object.entries(FILES).map(async ([name, file]) => {
    const res = await fetch(`/fonts/${file}`)
    if (!res.ok) throw new Error(`Font ${file} not loaded`)
    return [name, file, toBase64(await res.arrayBuffer())]
}))

export const registerFonts = async pdf => {
    for (const [name, file, data] of await loadFiles()) {
        pdf.addFileToVFS(file, data)
        pdf.addFont(file, name, 'normal')
    }
}

// Archivo for the titles (the display font of the site), Barlow Condensed for every other text, at the nearest weight
export const pdfFont = style => {
    if (/archivo/i.test(style.fontFamily)) return 'archivo600'
    const weight = Number(style.fontWeight) || 400
    return weight >= 580 ? 'barlow600' : weight >= 480 ? 'barlow500' : 'barlow400'
}
