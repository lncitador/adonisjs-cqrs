import { glob } from 'glob'
import { Application } from '@adonisjs/core/app'
import { InvalidHandlerException } from '../errors/main.js'
import { Type } from '../types/shared.js'
import { debug } from '../debug.js'

export interface DiscoveredHandler {
  HandlerClass: Type<any>
  filePath: string
}

/**
 * Discovers all handlers in the configured directories.
 * It returns an array of objects, each containing the HandlerClass and its filePath.
 */
export async function* discoverHandlers(app: Application<any>): AsyncGenerator<DiscoveredHandler> {
  const allHandlerFiles = await glob(app.makePath('**/*_handler.ts'), { ignore: 'node_modules/**' })

  for (const filePath of allHandlerFiles) {
    try {
      const handlerModule = await import(filePath)
      const HandlerClass = handlerModule.default

      if (typeof HandlerClass !== 'function') {
        throw new InvalidHandlerException(filePath, 'The default export is not a class.')
      }

      if (!HandlerClass) {
        throw new InvalidHandlerException(filePath, 'No default export found.')
      }

      yield { HandlerClass, filePath }
    } catch (error) {
      debug(`[CQRS] Error discovering handler from %s: %O`, filePath, error)
    }
  }
}
