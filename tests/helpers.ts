import { IgnitorFactory } from '@adonisjs/core/factories'
import { defineConfig, UNSAFE } from '../src/define_config.js'
import { stubsRoot } from '../stubs/main.js'

export const BASE_URL = new URL('./tmp/', import.meta.url)

export const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, BASE_URL).href)
  }

  return import(filePath)
}

type SetupAppOptions = {
  importer?: typeof IMPORTER
  config?: Record<string, any>
}

/**
 * Setup an AdonisJS app for testing
 */
export async function setupApp({ importer = IMPORTER, config = {} }: SetupAppOptions = {}) {
  const ignitor = new IgnitorFactory()
    .withCoreProviders()
    .withCoreConfig()
    .merge({
      rcFileContents: {
        providers: [() => import('../providers/cqrs_provider.js')],
        directories: {
          'cqrs.commands': 'app/commands',
          'cqrs.queries': 'app/queries',
          'cqrs.handlers': 'app/handlers',
        },
      },
      config: {
        cqrs: defineConfig({
          [UNSAFE]: true,
        }),
        ...config,
      },
    })
    .create(BASE_URL, {
      importer,
    })

  const app = ignitor.createApp('web')
  await app.init().then(() => app.boot())

  const ace = await app.container.make('ace')
  ace.ui.switchMode('raw')

  const stubManager = await app.stubs.create()

  return {
    ace,
    app,
    prepareStub: async (stubPath: string, data: Record<string, any>) => {
      const stub = await stubManager.build(stubPath, {
        source: stubsRoot,
      })

      return stub.prepare(data)
    },
  }
}
