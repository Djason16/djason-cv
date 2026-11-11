import { onMounted, onUnmounted, watch } from 'vue'
import { watchData } from '@/utils/liveData'

/*
 * Loads again the data of a component when its tables change on the server (utils/liveData.js), for as long as it is shown:
 *   onDataChange(['dc_unavailability'], fetchPeriods)
 *   onDataChange(['dc_calendar_settings'], fetchSettings, () => props.show)   only while the condition is true
 */
export const onDataChange = (tables: string[], reload: () => unknown, when: () => unknown = () => true) => {
    let stop: (() => void) | null = null
    onMounted(() => { stop = watchData(tables, () => when() && reload()) })
    onUnmounted(() => stop?.())
}

/*
 * The data of a modal: loaded each time it opens, and again while it is open when its tables change (another tab):
 *   useModalData(() => props.show, fetchPeriods, ['dc_unavailability'])
 */
export const useModalData = (isOpen: () => boolean, load: () => Promise<unknown>, tables: string[]) => {
    watch(isOpen, open => open && load(), { immediate: true })
    onDataChange(tables, load, isOpen)
}
