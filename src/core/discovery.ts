import { glob } from 'glob'
import { CqrsConfig } from '../types/config.js'
import { Application } from '@adonisjs/core/app'
import { Logger } from '@adonisjs/core/logger'
import { HandlersManager } from '../storages/handlers_manager.js'
import { METADATA_MAP } from '../decorators/constants.js'

/**
 * Discovers handlers of a specific type in the configured directories.
 */
export async function discoverHandlers(
  app: Application<any>,
  logger: Logger,
  config: CqrsConfig,
  handlersManager: HandlersManager,
  type: keyof typeof METADATA_MAP
): Promise<void> {
  const { directories } = config
  const discoveryDirs = (directories as any)[type] // Use as any to bypass strict type checking for now

  if (!discoveryDirs || discoveryDirs.length === 0) {
    logger.warn(`[CQRS] No directories configured for "${type}" handlers. Skipping discovery.`)
    return
  }

  try {
    let allHandlerFiles: string[] = []
    for (const dir of discoveryDirs) {
      const dirPath = app.makePath(dir)
      const handlerFiles = await glob(`${dirPath}/**/*_handler.ts`, {
        cwd: process.cwd(),
        absolute: true,
      })
      allHandlerFiles.push(...handlerFiles)
    }

    logger.info(`[CQRS] Discovered ${allHandlerFiles.length} "${type}" handlers`)

    for (const filePath of allHandlerFiles) {
      try {
        await registerSubjectHandlerFromFile(filePath, handlersManager, type)
      } catch (error) {
        logger.error(`[CQRS] Error registering handler from ${filePath}:`, error)
      }
    }
  } catch (error) {
    logger.error(`[CQRS] Error during "${type}" handler discovery:`, error)
    throw error
  }
}

/**
 * Registers a single handler from a file path for a given subject type.
 */
async function registerSubjectHandlerFromFile(
  filePath: string,
  handlersManager: HandlersManager,
  type: keyof typeof METADATA_MAP
): Promise<void> {
  const handlerModule = await import(filePath)
  const HandlerClass = handlerModule.default

  if (!HandlerClass) {
    throw new Error(`No default export found in ${filePath}`)
  }

  const handlerMetadataKey = METADATA_MAP[type].handler
  const subjectClass = Reflect.getMetadata(handlerMetadataKey, HandlerClass)

  if (!subjectClass) {
    throw new Error(
      `Handler ${HandlerClass.name} is not decorated with the correct decorator for type "${type}"`
    )
  }

  handlersManager.registerHandler(type, subjectClass, HandlerClass, filePath)
}
