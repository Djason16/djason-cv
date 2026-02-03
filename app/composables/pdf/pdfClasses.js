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
        '.signature-block',
        '.example-box',
        '.payment-options',
        '.bank-table',
        '.items-table',
        '.quote-signature-section',
        'table',
        'thead',
        'tbody'
    ]

    // Apply no-break to all critical blocks
    criticalSelectors.forEach(selector =>
        rootElement
            .querySelectorAll(selector)
            .forEach(el => el.classList.add('no-break'))
    )

    // Keep headings attached to the content that follows
    rootElement
        .querySelectorAll('h1, h2, h3, h4, h5, h6, .section-title, .section-subtitle')
        .forEach(el => el.classList.add('no-break-after'))
}