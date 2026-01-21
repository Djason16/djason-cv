export default defineEventHandler(event => {
    // Determine result type from query, default to 'success'
    const resultType = getQuery(event).type === 'cancel' ? 'cancel' : 'success'

    // Set HTML response header
    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')

    // Render appropriate payment result page
    return renderPaymentPage(resultType)
})