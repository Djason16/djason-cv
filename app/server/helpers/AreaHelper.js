/*
 * The area shown on the public pages instead of the exact address (admin > My info: "area"), worked out from the address:
 *   await AreaHelper.of('62 rue Danielle Casanova, 93200 Saint-Denis')   'Île-de-France, France'
 *   await AreaHelper.of('Thourotte, France')                             'Hauts-de-France, France'
 *   await AreaHelper.of('Rue Neuve 1, 1000 Bruxelles, Belgique')        its region and country with Google; without it: 'Belgique'
 * In France: the public service of the French towns (geo.api.gouv.fr, free, no key), by the postal code when there is one
 * (two Saint-Denis: 93200 near Paris, 97400 in La Réunion), else the town of that name with the most people.
 * Outside France only: Google (Geocoding API, the GOOGLE_MAPS_API_KEY of the .env), its region; without a key or an answer,
 * the country. Both are called by the server only: the visitors send nothing, no cookie.
 * null when no service answers: the area already saved is then kept (SettingsHelper), never replaced by a guess.
 */
import { townOf } from '~/utils/address.js'

// How long a service may take to answer (milliseconds)
const TIMEOUT = 8000

// "Thourotte" and "thourotte" are the same town; accents, spaces and dashes do not count
const plain = text => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '')

// Google: the region (administrative_area_level_1) and the country of the address, in French; null when it cannot say
const fromGoogle = async address => {
    const key = useRuntimeConfig().googleMapsApiKey
    if (!key) return null
    try {
        const res = await $fetch('https://maps.googleapis.com/maps/api/geocode/json', { query: { address, key, language: 'fr' }, timeout: TIMEOUT })
        if (res.status !== 'OK') {
            if (res.status !== 'ZERO_RESULTS') console.warn('[area] Google:', res.status, res.error_message || '')
            return null
        }
        const parts = res.results[0]?.address_components || []
        const country = parts.find(p => p.types.includes('country'))
        const region = parts.find(p => p.types.includes('administrative_area_level_1'))
        if (!country) return null
        const name = country.short_name === 'FR' ? 'France' : country.long_name
        return region ? `${region.long_name}, ${name}` : name
    } catch (error) {
        console.warn('[area] Google:', error.message)
        return null
    }
}

// The public service of the French towns (France only); a search that fails (no answer in time) counts as nothing found
const search = query => $fetch('https://geo.api.gouv.fr/communes', { query: { fields: 'nom,region', ...query }, timeout: TIMEOUT })
    .catch(error => (console.warn('[area]', error.message), null))
const fromTowns = async (address, town) => {
    const postalCode = String(address).match(/\b\d{5}\b/)?.[0]
    // By its postal code (certain); a postal code that does not exist, or no answer: by its name
    const byCode = postalCode ? await search({ codePostal: postalCode }) : null
    const towns = byCode?.length ? byCode : await search({ nom: town, boost: 'population', limit: 10 })
    if (!towns) return byCode ? 'France' : null
    const found = towns.find(t => plain(t.nom) === plain(town)) || towns[0]
    return found?.region?.nom ? `${found.region.nom}, France` : 'France'
}

export const AreaHelper = {
    async of(address) {
        // "12 rue des Lilas, 60150 Thourotte, France" -> "Thourotte, France" (utils/address.js)
        const place = townOf(address)
        if (!place) return ''
        const [town, country] = place.split(',').map(part => part.trim())
        if (plain(country) === 'france') return fromTowns(address, town)
        // Abroad: Google, else the country as it is written
        return (await fromGoogle(address)) || country
    },
}
