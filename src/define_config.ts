import { CqrsConfig } from './types/config.js'

const defaultConfig: CqrsConfig = {
  directories: {
    command: ['./app/**/commands'],
    query: ['./app/**/queries'],
  },
  generator: {
    root: 'app',
  },
}

export function defineConfig(config: Partial<CqrsConfig> = {}): CqrsConfig {
  return {
    ...defaultConfig,
    ...config,
  }
}
