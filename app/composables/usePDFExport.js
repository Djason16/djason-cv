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
            style: 'position:fixed;left:-9999px;top:0;width:210mm;background:#fff;overflow:visible;'
        })
        document.body.appendChild(container)

        try {
            // Mount component
            const app = createApp(component, componentProps)
            app.mount(container)
            await nextTick()

            // Optional delay for fonts/layout
            if (pdfOptions.delay) {
                await new Promise(resolve => setTimeout(resolve, pdfOptions.delay))
            }

            const el = container.querySelector(containerClass)
            if (!el) throw new Error(`Element ${containerClass} not found`)

            const html2pdf = (await import('html2pdf.js')).default

            // Default PDF options with merge capability
            const defaultOpt = {
                margin: [5, 5, 5, 5],
                filename: `${fileName}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
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
        } finally {
            document.body.removeChild(container)
        }
    }

    return { renderAndExport }
}