import { createApp, nextTick } from 'vue'
import { addNoBreakClasses } from './pdf/pdfClasses'
import { applyPageBreakStyles } from './pdf/pdfStyles'
import { waitForElement } from './pdf/pdfUtils'

export const usePDFExport = () => {
    const renderAndExport = async ({
        component,
        componentProps,
        fileName,
        containerClass,
        pdfOptions = {}
    }) => {
        if (process.server) return

        // Offscreen container used for rendering the PDF layout
        const container = Object.assign(document.createElement('div'), {
            style: `
                position: fixed;
                left: -9999px;
                top: 0;
                width: 210mm;
                background: #fff;
                overflow: visible;
                z-index: 9999;
            `
        })

        document.body.appendChild(container)

        try {
            // Mount component into the hidden container
            const app = createApp(component, componentProps)
            app.mount(container)
            await nextTick()

            // Inject print-safe CSS rules
            const styleElement = applyPageBreakStyles()

            // Allow layout, images, and fonts to fully settle
            await new Promise(r => setTimeout(r, pdfOptions.delay || 1500))

            // Wait for the target element to exist and be measurable
            const el = await waitForElement(container, containerClass)

            // Mark critical nodes to prevent page splitting
            addNoBreakClasses(el)

            const html2pdf = (await import('html2pdf.js')).default

            const defaultOptions = {
                margin: [5, 5, 5, 5],
                filename: `${fileName}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    scrollX: 0,
                    scrollY: 0,
                    windowHeight: el.scrollHeight,
                    logging: false,
                    letterRendering: true
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: {
                    mode: ['avoid-all', 'css', 'legacy'],
                    before: ['.page-break-before'],
                    after: ['.page-break-after'],
                    avoid: [
                        'tr', 'img', 'table', 'thead', 'tbody',
                        '.section', '.no-break',
                        '.payment-details', '.payment-option-selected',
                        '.payment-option-alternative', '.stripe-fees-detail',
                        '.bank-transfer-option', '.automatic-debit-section',
                        '.info-block', '.totals-section', '.totals-table',
                        '.signature-block', '.signature-section',
                        '.example-box', '.payment-options', '.option-item',
                        '.bank-table', '.items-table',
                        '.quote-signature-section', '.signature-box',
                        '.client-section', '.delivery-section',
                        '.legal-text', '.payment-conditions',
                        '.bullet-list', 'ul', 'ol',
                        '.service-list', '.company-details', '.document-info'
                    ]
                }
            }

            // Merge user overrides while preserving deep defaults
            const options = {
                ...defaultOptions,
                ...pdfOptions,
                html2canvas: {
                    ...defaultOptions.html2canvas,
                    ...pdfOptions.html2canvas
                },
                jsPDF: {
                    ...defaultOptions.jsPDF,
                    ...pdfOptions.jsPDF
                },
                pagebreak: {
                    ...defaultOptions.pagebreak,
                    ...pdfOptions.pagebreak,
                    avoid: [
                        ...defaultOptions.pagebreak.avoid,
                        ...(pdfOptions.pagebreak?.avoid || [])
                    ]
                }
            }

            await html2pdf().set(options).from(el).save()

            app.unmount()
            styleElement?.parentNode?.removeChild(styleElement)
        } catch (err) {
            console.error('PDF export failed:', err)
            throw err
        } finally {
            document.body.removeChild(container)
        }
    }

    return { renderAndExport }
}