// No "x-powered-by: Nuxt" header, neither on the pages nor on the API: it only tells attackers what the site runs on
export default defineNitroPlugin(nitroApp => {
    nitroApp.hooks.hook('beforeResponse', event => removeResponseHeader(event, 'x-powered-by'))
    nitroApp.hooks.hook('render:response', response => {
        if (response?.headers) delete response.headers['x-powered-by']
    })
})
