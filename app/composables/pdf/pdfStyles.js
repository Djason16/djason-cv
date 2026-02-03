export const applyPageBreakStyles = () => {
    const styleId = 'pdf-pagebreak-styles'

    // Remove existing style to avoid duplicates
    document.getElementById(styleId)?.remove()

    const style = document.createElement('style')
    style.id = styleId

    // Centralized CSS rules for print-friendly page breaking
    style.textContent = `
        /* Prevent unwanted page breaks inside key blocks */
        .no-break,
        .section,
        .payment-details,
        .payment-option-selected,
        .payment-option-alternative,
        .stripe-fees-detail,
        .bank-transfer-option,
        .automatic-debit-section,
        .info-block,
        .totals-section,
        .signature-block,
        .example-box,
        .payment-options,
        .option-item,
        .bank-table,
        .items-table,
        .quote-signature-section,
        .signature-box,
        .client-section,
        .delivery-section,
        .legal-text,
        .payment-conditions,
        table,
        thead,
        tbody,
        tfoot,
        tr,
        th,
        td,
        ul,
        ol,
        .bullet-list,
        .bullet-list li,
        .signature-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        /* Keep headings and section titles with their content */
        h1, h2, h3, h4, h5, h6,
        .section-title,
        .section-subtitle,
        .no-break-after {
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        /* Improve paragraph readability across pages */
        p,
        .section-text,
        .info-content {
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

        /* Ensure payment detail children stay together */
        .payment-details > * {
            page-break-inside: avoid !important;
        }
    `

    document.head.appendChild(style)
    return style
}