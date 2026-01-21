import { createApp, nextTick } from 'vue'

export const usePDFExport = () => {
    const renderAndExport = async ({
        component,
        componentProps,
        fileName,
        containerClass,
        pdfOptions = {}
    }) => {
        if (process.server) return

        // Create hidden A4 container
        const container = Object.assign(document.createElement('div'), {
            style: 'position:fixed;left:-9999px;top:0;width:210mm;background:#fff;overflow:visible;z-index:9999;'
        })
        document.body.appendChild(container)

        try {
            // Mount component
            const app = createApp(component, componentProps)
            app.mount(container)

            // Wait for Vue to render the component
            await nextTick()

            // Please wait a little longer for the fonts and images
            await new Promise(resolve => setTimeout(resolve, pdfOptions.delay || 1000))

            // Search for the element - with a longer delay for async data
            const waitForElement = async (container, selector, timeout = 5000) => {
                const start = Date.now()
                while (Date.now() - start < timeout) {
                    const el = container.querySelector(selector)
                    if (el && el.offsetHeight > 0) return el
                    await new Promise(r => setTimeout(r, 100))
                }
                throw new Error(`Element ${selector} not found or empty after ${timeout}ms`)
            }

            const el = await waitForElement(container, containerClass)

            const html2pdf = (await import('html2pdf.js')).default

            // Default PDF options
            const defaultOpt = {
                margin: [5, 5, 5, 5],
                filename: `${fileName}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            }

            // Deep merge options
            const opt = {
                ...defaultOpt,
                ...pdfOptions,
                html2canvas: { ...defaultOpt.html2canvas, ...pdfOptions.html2canvas },
                jsPDF: { ...defaultOpt.jsPDF, ...pdfOptions.jsPDF },
                pagebreak: { ...defaultOpt.pagebreak, ...pdfOptions.pagebreak }
            }

            await html2pdf().set(opt).from(el).save()
            app.unmount()
        } catch (error) {
            console.error('PDF Export failed:', error)
            throw error
        } finally {
            document.body.removeChild(container)
        }
    }

    return { renderAndExport }
}