export const addNoBreakClasses = rootElement => {
    // Selectors that must never split across pages
    const criticalSelectors = [
        '.section',
        '.payment-details',
        '.payment-option-selected',
        '.payment-option-alternative',
        '.stripe-fees-detail',
        '.bank-transfer-option',
        '.automatic-debit-section',
        '.info-block',
        '.totals-section',
        '.totals-table',
        '.signature-block',
        '.signature-section',
        '.example-box',
        '.payment-options',
        '.option-item',
        '.bank-table',
        '.items-table',
        '.quote-signature-section',
        '.signature-box',
        '.client-section',
        '.delivery-section',
        '.legal-text',
        '.payment-conditions',
        '.bullet-list',
        '.service-list',
        '.company-details',
        '.document-info',
        'table',
        'thead',
        'tbody',
        'tr',
        'img',
        'ul',
        'ol'
    ]

    // Apply no-break class + inline styles so html2canvas les voit avant screenshot
    criticalSelectors.forEach(selector =>
        rootElement
            .querySelectorAll(selector)
            .forEach(el => {
                el.classList.add('no-break')
                el.style.pageBreakInside = 'avoid'
                el.style.breakInside = 'avoid'
            })
    )

    // Keep headings attached to the content that follows
    rootElement
        .querySelectorAll('h1, h2, h3, h4, h5, h6, .section-title, .section-subtitle')
        .forEach(el => {
            el.classList.add('no-break-after')
            el.style.pageBreakAfter = 'avoid'
            el.style.breakAfter = 'avoid'
            el.style.pageBreakInside = 'avoid'
            el.style.breakInside = 'avoid'
        })

    // Force all direct children of .content not to cut themselves
    const content = rootElement.querySelector('.content')
    if (content) {
        Array.from(content.children).forEach(child => {
            child.style.pageBreakInside = 'avoid'
            child.style.breakInside = 'avoid'
        })
    }
}