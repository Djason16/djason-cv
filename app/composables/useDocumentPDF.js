import { createApp, nextTick } from 'vue'
import DocumentContainer from '~/components/ui/Document/DocumentContainer.vue'

export const useDocumentPDF = () => {
    // Render component offscreen and export as PDF using html2pdf
    const renderAndExport = async ({ componentProps, fileName }) => {
        // Create hidden container
        const container = Object.assign(document.createElement('div'), {
            style: 'position:fixed;left:-9999px;top:0;width:210mm;background:#fff;overflow:visible;'
        })
        document.body.appendChild(container)

        try {
            // Mount the document component
            const app = createApp(DocumentContainer, componentProps)
            app.mount(container)
            await nextTick()

            const el = container.querySelector('.document-container')
            if (!el) throw new Error('Document element not found')

            // Import html2pdf dynamically
            const html2pdf = (await import('html2pdf.js')).default

            // Configure PDF options without margins
            const opt = {
                margin: 0, // no margins
                filename: `${fileName}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // avoid cutting content mid-line
            }

            // Generate PDF
            await html2pdf().set(opt).from(el).save()
            app.unmount()
        } finally {
            document.body.removeChild(container)
        }
    }

    return { renderAndExport }
}