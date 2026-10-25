// Base route of the API (DC Scaffold convention: https://github.com/Djason16/dc-scaffold): GET /api
export default defineEventHandler(event =>
    ResponseHelper.success(event, {
        message: 'API ready',
        environment: process.env.NODE_ENV || 'development',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        current_time: new Date().toISOString(),
    }),
)
