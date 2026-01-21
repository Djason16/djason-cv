module.exports = {
    apps: [
        {
            name: 'djason-chery-nuxt-fullstack',
            script: '.output/server/index.mjs',
            cwd: './',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: ['.env.production'],
            max_memory_restart: '500M',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        },
    ],
}