import { useLang } from './useLang.js'
import { useSite } from './useSite.js'
import { watch } from 'vue'
import { seoMetaData } from '@/utils/seo.js'

// <head> of a page from the SEO config of utils/seo.js (title, description, Open Graph, JSON-LD),
// rendered in the generated HTML and updated when the language changes (DC Scaffold (https://github.com/Djason16/dc-scaffold), used as useSeo('index')
export const useSeo = (pageKey) => {
    const lang = useLang()
    const site = useSite()
    const apply = () => useSeoMeta(seoMetaData(pageKey, lang, site))

    apply()
    watch(() => lang.current.value, apply)
}
