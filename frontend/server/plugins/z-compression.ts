import { brotliCompressSync, constants, gzipSync } from 'node:zlib'

/*
 * Pages compressed before they leave the server (brotli, else gzip): the host (Infomaniak, Node.js) sends the pages
 * rendered by Nuxt as they are, about 60 KB for the home page instead of about 12 KB. The files of the build are
 * already compressed at build time (nitro.compressPublicAssets).
 * The "z-" of the name: Nitro loads its plugins in alphabetical order, this one must come after the ones that change
 * the text of the pages (qualif.ts, which moves the addresses into the folder of the qualif).
 */
// Smaller pages are not worth it
const MIN_BYTES = 1024

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('render:response', (response, { event }) => {
        if (typeof response.body !== 'string' || response.body.length < MIN_BYTES) return
        const accepted = String(getRequestHeader(event, 'accept-encoding') ?? '')
        const body = Buffer.from(response.body)
        // Quality 5 of brotli: almost as small as the best, fast enough for each visit
        if (/\bbr\b/.test(accepted)) {
            response.body = brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } }) as unknown as string
            response.headers = { ...response.headers, 'content-encoding': 'br', vary: 'Accept-Encoding' }
        } else if (/\bgzip\b/.test(accepted)) {
            response.body = gzipSync(body) as unknown as string
            response.headers = { ...response.headers, 'content-encoding': 'gzip', vary: 'Accept-Encoding' }
        }
    })
})
