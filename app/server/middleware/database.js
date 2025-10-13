import { useDatabase } from '#imports'

export default defineEventHandler(event => {
    // Attach database instance to request context
    event.context.db = useDatabase()
})