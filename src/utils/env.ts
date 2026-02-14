import { resolve } from 'path'
import { config } from 'dotenv'

// resolve config file
const envFilePath = resolve(process.cwd(), '.env')
const ipValidate: RegExp = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/

// set current environment variable file
config({ path: envFilePath })

/**
 * Method to validate if environment variables found in file utils/env.ts
 *
 * @param name Name of the environment variable in .env
 * @param defaultValue default value to set if environment variable is not set
 * @returns environment variable value
 */
export const getEnvVar = (name: string, defaultValue?: string): string => {
    const value = process.env[name]

    if (!value && defaultValue) {
        return defaultValue
    }

    if (!value) {
        return '' // Return empty string instead of crashing
    }

    // return env variable
    return value
}