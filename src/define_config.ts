import { CqrsConfig } from './types/config.js'

export const UNSAFE = Symbol('UNSAFE')

const defaultConfig: CqrsConfig = {
  [UNSAFE]: false,
  generator: {
    root: 'app',
  },
}

export function defineConfig(config: Partial<CqrsConfig> = {}) {
  return {
    ...defaultConfig,
    ...config,
  } as CqrsConfig
}
