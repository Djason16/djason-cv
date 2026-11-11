import { useLang } from './useLang'
import { useSite } from './useSite'
import { watch } from 'vue'
import { seoMetaData } from '@/utils/seo'

// <head> of a page from the SEO config of utils/seo.ts (title, description, Open Graph, JSON-LD),
// rendered in the generated HTML and updated when the language changes (DC Scaffold (https://github.com/Djason16/dc-scaffold), used as useSeo('index')
export const useSeo = (pageKey: string) => {
    const lang = useLang()
    const site = useSite()
    // Builds the <head> of the page (again when the language changes)
    const apply = () => useSeoMeta(seoMetaData(pageKey, lang, site))

    apply()
    watch(() => lang.current.value, apply)
}
