import { CqrsConfig } from './types/config.js'

const defaultConfig: CqrsConfig = {
  directories: {
    commands: ['./app/**/commands'],
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
