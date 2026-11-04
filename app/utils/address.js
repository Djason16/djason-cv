/*
 * The town and country of a full postal address (the billing address of admin > My info), used as the address of the
 * legal pages when the owner ticks "same address" (the server and the form read it the same way):
 *   townOf('12 rue des Lilas, 60150 Thourotte, France')   'Thourotte, France'
 *   townOf('12 rue des Lilas, 60150 Thourotte')           'Thourotte, France'   (no country written: France)
 *   townOf('Rue Neuve 1, 1000 Bruxelles, Belgique')      'Bruxelles, Belgique'
 */
const POSTAL_CODE = /\b\d{4,5}\b/g

export const townOf = full => {
    const parts = String(full || '').split(/[,\n]/).map(part => part.trim()).filter(Boolean)
    if (!parts.length) return ''
    // The last part is the country when it has no figures (a postal code means it is the town)
    const last = parts[parts.length - 1]
    const hasCountry = parts.length > 1 && !/\d/.test(last)
    const country = hasCountry ? last : 'France'
    const rest = hasCountry ? parts.slice(0, -1) : parts
    // The town: the part with the postal code (the last one), without it; else the last part before the country
    const withCode = [...rest].reverse().find(part => new RegExp(POSTAL_CODE.source).test(part))
    const town = (withCode || rest[rest.length - 1]).replace(POSTAL_CODE, '').trim()
    return town ? `${town}, ${country}` : country
}

// What the area of the site is worked out from (AreaHelper): the billing address when it is the same address, or when the
// address typed apart is in its town (its postal code makes the town certain); else the address typed apart
const sameTown = (a, b) => String(a).split(',')[0].trim().toLowerCase() === String(b).split(',')[0].trim().toLowerCase()
export const areaSource = ({ sameAddress, address, invoiceAddress }) => {
    if (isTicked(sameAddress)) return invoiceAddress || ''
    if (/\b\d{5}\b/.test(address || '')) return address
    return invoiceAddress && address && sameTown(townOf(invoiceAddress), address) ? invoiceAddress : (address || '')
}

// The "same address" box, saved as '1' or '' (dc_settings keeps texts)
export const isTicked = value => value === true || value === '1' || value === 'true'
