import { createApp, nextTick } from 'vue'
import ContractContainer from '~/components/ui/Contract/ContractContainer.vue'

export const useContractPDF = () => {
    const renderAndExport = async ({ componentProps, fileName }) => {
        // Mount component offscreen in A4-sized container
        const container = Object.assign(document.createElement('div'), {
            style: 'position:fixed;left:-9999px;top:0;width:210mm;background:#fff;overflow:visible;'
        })
        document.body.appendChild(container)

        try {
            const app = createApp(ContractContainer, componentProps)
            app.mount(container)
            await nextTick()
            await new Promise(resolve => setTimeout(resolve, 500)) // Wait for fonts/layout to settle

            const el = container.querySelector('.contract-container')
            if (!el) throw new Error('Contract element not found')

            const html2pdf = (await import('html2pdf.js')).default

            const opt = {
                margin: [10, 10, 10, 10],
                filename: `${fileName}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0, windowWidth: el.scrollWidth, windowHeight: el.scrollHeight, letterRendering: true, logging: false, removeContainer: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.page-break' }
            }

            await html2pdf().set(opt).from(el).save()
            app.unmount()
        } finally {
            document.body.removeChild(container)
        }
    }

    return { renderAndExport }
}