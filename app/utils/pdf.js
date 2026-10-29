import { createApp, nextTick } from 'vue'

/*
 * PDF of a quote, invoice or contract, made in the browser with html2pdf.js:
 *   1. the Vue template (components/views/Documents) is mounted in a hidden A4 container
 *   2. print rules are added so blocks are not cut between two pages
 *   3. html2pdf takes a picture of the container and saves the PDF
 *
 *   await exportPdf({ component: DocumentContainer, props: {...}, fileName: 'DE-2026-0001', selector: '.document-container' })
 *
 * The page-break rules rely on the CSS classes of the templates (.section, .totals-table...): keep them when editing a template.
 */

// Blocks that must never be split across two pages
const NO_BREAK_SELECTORS = [
    '.section', '.payment-details', '.payment-option-selected', '.payment-option-alternative', '.stripe-fees-detail',
    '.bank-transfer-option', '.automatic-debit-section', '.info-block', '.totals-section', '.totals-table',
    '.signature-block', '.signature-section', '.example-box', '.payment-options', '.option-item', '.bank-table',
    '.items-table', '.quote-signature-section', '.signature-box', '.client-section', '.delivery-section',
    '.legal-text', '.payment-conditions', '.bullet-list', '.service-list', '.company-details', '.document-info',
    'table', 'thead', 'tbody', 'tr', 'img', 'ul', 'ol',
]

// Print rules shared by every document, added to <head> while the PDF is made
const PAGE_BREAK_CSS = `
    /* Prevents unwanted page breaks inside key blocks */
    .no-break, .section, .payment-details, .payment-option-selected, .payment-option-alternative,
    .stripe-fees-detail, .bank-transfer-option, .automatic-debit-section, .info-block, .totals-section,
    .signature-block, .example-box, .payment-options, .option-item, .bank-table, .items-table,
    .quote-signature-section, .signature-box, .client-section, .delivery-section, .legal-text,
    .payment-conditions, table, thead, tbody, tfoot, tr, th, td, ul, ol, .bullet-list, .bullet-list li,
    .signature-item {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    /* Keeps headings and section titles with their content */
    h1, h2, h3, h4, h5, h6, .section-title, .section-subtitle, .no-break-after {
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    /* Improve paragraph readability across pages */
    p, .section-text, .info-content {
        orphans: 3 !important;
        widows: 3 !important;
    }

    /* Explicit page break helpers */
    .page-break-before {
        page-break-before: always !important;
        break-before: page !important;
    }
    .page-break-after {
        page-break-after: always !important;
        break-after: page !important;
    }

    /* Layout spacing adjustments */
    .section {
        margin-bottom: 20px !important;
    }

    /* Ensures payment detail children and main content stay together */
    .payment-details > *, .content > * {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }
`

// Adds the page break rules to the page while the PDF is made
const addPageBreakStyles = () => {
    document.getElementById('pdf-pagebreak-styles')?.remove()
    const style = Object.assign(document.createElement('style'), { id: 'pdf-pagebreak-styles', textContent: PAGE_BREAK_CSS })
    document.head.appendChild(style)
    return style
}

// Same rules as inline styles, so html2canvas sees them before the picture is taken
const markNoBreak = root => {
    const avoid = el => {
        el.style.pageBreakInside = 'avoid'
        el.style.breakInside = 'avoid'
    }
    NO_BREAK_SELECTORS.forEach(selector => root.querySelectorAll(selector).forEach(el => {
        el.classList.add('no-break')
        avoid(el)
    }))
    // Headings stay attached to the content that follows
    root.querySelectorAll('h1, h2, h3, h4, h5, h6, .section-title, .section-subtitle').forEach(el => {
        el.classList.add('no-break-after')
        el.style.pageBreakAfter = 'avoid'
        el.style.breakAfter = 'avoid'
        avoid(el)
    })
    Array.from(root.querySelector('.content')?.children ?? []).forEach(avoid)
}

// The template is rendered once it has a size (polled every 100 ms)
const waitForElement = async (container, selector, timeout = 5000) => {
    for (const start = Date.now(); Date.now() - start < timeout; await new Promise(r => setTimeout(r, 100))) {
        const element = container.querySelector(selector)
        if (element?.offsetHeight > 0) return element
    }
    throw new Error(`Element ${selector} not found or empty after ${timeout}ms`)
}

/**
 * Renders a document template and saves it as a PDF.
 * @param {{ component: object, props: object, fileName: string, selector: string, html2canvas?: object }} options
 */
export const exportPdf = async ({ component, props, fileName, selector, html2canvas = {} }) => {
    if (import.meta.server) return

    // Offscreen A4 container used for rendering the PDF layout
    const container = document.createElement('div')
    container.style.cssText = 'position: fixed; left: -9999px; top: 0; width: 210mm; background: #fff; overflow: visible; z-index: 9999;'
    document.body.appendChild(container)

    try {
        const app = createApp(component, props)
        app.mount(container)
        await nextTick()

        const style = addPageBreakStyles()

        // Let layout, images and fonts settle
        await new Promise(r => setTimeout(r, 1500))

        const el = await waitForElement(container, selector)
        markNoBreak(el)

        // Loaded only when a PDF is made (large library)
        const html2pdf = (await import('html2pdf.js')).default
        await html2pdf().set({
            margin: [10, 10, 10, 10],
            delay: 1500,
            filename: `${fileName}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 794,
                logging: false,
                letterRendering: true,
                allowTaint: false,
                imageTimeout: 0,
                ...html2canvas,
                windowHeight: el.scrollHeight,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
            pagebreak: {
                mode: ['avoid-all', 'css', 'legacy'],
                before: ['.page-break-before'],
                after: ['.page-break-after'],
                avoid: ['.no-break', ...NO_BREAK_SELECTORS],
            },
        }).from(el).save()

        app.unmount()
        style.remove()
    } catch (err) {
        console.error('PDF export failed:', err)
        throw err
    } finally {
        container.remove()
    }
}
