import { reactive, watch } from 'vue'
import { useLang } from './useLang.js'
import { api } from '@/utils/api.js'
import { showFailure } from '@/utils/dialog.js'

// Time without typing before the text is translated, and how long "Translated" stays (milliseconds)
const WAIT = 1000
const DONE_SHOWN = 3000

/**
 * Translation of one text through the API (POST /api/translate, MyMemory: server/helpers/TranslateHelper.js).
 * @returns {Promise<{ success: boolean, translations?: Record<string, string>, error?: string }>}
 */
export const translateText = (text, from = 'fr', to = ['en']) => api.post('/translate', { text, from, to })

/*
 * Machine translation in an admin form, as on Battle Arena: the text typed in French fills the English a moment after.
 * The English follows only while it was not changed by hand (empty, as when the form opened, or as translated).
 *   const auto = useAutoTranslate(form, [['short_fr', 'short_en']])
 *   auto.reset()               when the form opens or is emptied (the values of now are "not changed by hand")
 *   auto.status.short_fr       'translating' | 'done' (a moment)
 * An error (free quota used up...) opens the pop-up of the site.
 */
export const useAutoTranslate = (form, pairs, { from = 'fr', to = 'en' } = {}) => {
    const { getTranslation: t } = useLang()
    const status = reactive({})
    const filled = {}
    let initial = { ...form }
    const timers = {}

    const canFill = id => !form[id] || form[id] === filled[id] || form[id] === initial[id]

    const run = async (source, target) => {
        const text = String(form[source] ?? '').trim()
        if (!text || !canFill(target)) return
        status[source] = 'translating'
        const res = await translateText(text, from, [to])
        if (!res.success) {
            delete status[source]
            return showFailure(t(res.error || 'translateUnavailable'))
        }
        // The English changed by hand while waiting stays as it is
        if (canFill(target) && res.translations?.[to]) form[target] = filled[target] = res.translations[to]
        status[source] = 'done'
        setTimeout(() => status[source] === 'done' && delete status[source], DONE_SHOWN)
    }

    pairs.forEach(([source, target]) => watch(() => form[source], (now, before) => {
        if (now === before || now === initial[source]) return
        clearTimeout(timers[source])
        timers[source] = setTimeout(() => run(source, target), WAIT)
    }))

    const reset = () => {
        initial = { ...form }
        Object.keys(filled).forEach(id => delete filled[id])
        Object.values(timers).forEach(clearTimeout)
        Object.keys(status).forEach(id => delete status[id])
    }

    return { status, reset }
}
