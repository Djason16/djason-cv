module.exports = {
    apps: [{
        name: 'nuxt-app',
        script: '.output/server/index.mjs',
        cwd: './',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',

        env_production: {
            NODE_ENV: 'production',
            PORT: 3000,
        },
    }],
}