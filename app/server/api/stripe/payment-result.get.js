export default defineEventHandler((event) => {
    const { type } = getQuery(event)

    const resultType = type === 'cancel' ? 'cancel' : 'success'

    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return renderPaymentPage(resultType)
})