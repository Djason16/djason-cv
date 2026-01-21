import { resolve } from 'path'

// Return absolute path to the correct .env file based on NODE_ENV
export const getEnvFilePath = () =>
    resolve(process.cwd(), process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development')