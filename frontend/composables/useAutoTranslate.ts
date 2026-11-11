import { reactive, watch } from 'vue'
import { useLang } from './useLang'
import { api } from '@/utils/api'
import { showFailure } from '@/utils/dialog'

// Time without typing before the text is translated, and how long "Translated" stays (milliseconds)
const WAIT = 1000
const DONE_SHOWN = 3000

/**
 * Translation of one text through the API (POST /api/translate, MyMemory: server/helpers/TranslateHelper.js).
 * @returns >}
 */
export const translateText = (text: string, from = 'fr', to = ['en']): Promise<{ success: boolean, translations?: Record<string, string>, error?: string  }> => api.post('/translate', { text, from, to })

/*
 * Machine translation in an admin form, as on Battle Arena: the text typed in French fills the English a moment after.
 * The English follows only while it was not changed by hand (empty, as when the form opened, or as translated).
 *   const auto = useAutoTranslate(form, [['short_fr', 'short_en']])
 *   auto.reset()               when the form opens or is emptied (the values of now are "not changed by hand")
 *   auto.status.short_fr       'translating' | 'done' (a moment)
 * An error (free quota used up...) opens the pop-up of the site.
 */
export const useAutoTranslate = (form: Record<string, any>, pairs: [string, string][], { from = 'fr', to = 'en' }: { from?: string, to?: string } = {}) => {
    const { getTranslation: t } = useLang()
    const status = reactive<Record<string, 'translating' | 'done'>>({})
    const filled: Record<string, string> = {}
    let initial: Record<string, any> = { ...form }
    const timers: Record<string, ReturnType<typeof setTimeout>> = {}

    const canFill = (id: string) => !form[id] || form[id] === filled[id] || form[id] === initial[id]

    const run = async (source: string, target: string) => {
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
        Object.values(timers).forEach(timer => clearTimeout(timer))
        Object.keys(status).forEach(id => delete status[id])
    }

    return { status, reset }
}
