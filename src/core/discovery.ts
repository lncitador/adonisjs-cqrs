import { glob } from 'glob'
import { CommandBus } from '../buses/command.js'
import { COMMAND_HANDLER_METADATA, COMMAND_METADATA } from '../decorators/constants.js'
import { CqrsConfig } from '../types/config.js'
import { Application } from '@adonisjs/core/app'
import { Logger } from '@adonisjs/core/logger'

/**
 * Discovers command handlers in the configured directories and registers them with the CommandBus
 */
export async function discoverCommandHandlers(
  app: Application<any>,
  logger: Logger,
  config: CqrsConfig,
  commandBus: CommandBus
): Promise<void> {
  const { directories } = config

  try {
    let allHandlerFiles: string[] = []
    for (const commandDir of directories.commands) {
      const dirPath = app.makePath(commandDir)
      const handlerFiles = await glob(`${dirPath}/**/*_handler.ts`, {
        cwd: process.cwd(),
        absolute: true,
      })

      logger.info(`[CQRS] Found ${handlerFiles.length} handlers in ${dirPath}`)

      allHandlerFiles.push(...handlerFiles)
    }

    logger.info(`[CQRS] Discovered ${allHandlerFiles.length} command handlers`)

    // Process each handler file
    for (const filePath of allHandlerFiles) {
      try {
        await registerHandlerFromFile(filePath, commandBus)
      } catch (error) {
        logger.error(`[CQRS] Error registering handler from ${filePath}:`, error)
        // Continue processing other handlers even if one fails
      }
    }
  } catch (error) {
    logger.error('[CQRS] Error during handler discovery:', error)
    throw error
  }
}

/**
 * Registers a single handler from a file path
 */
async function registerHandlerFromFile(filePath: string, commandBus: CommandBus): Promise<void> {
  // Dynamic import of the handler module
  const handlerModule = await import(filePath)

  // Get the default export (handler class)
  const HandlerClass = handlerModule.default

  if (!HandlerClass) {
    throw new Error(`No default export found in ${filePath}`)
  }

  // Get the command class from metadata
  const commandClass = Reflect.getMetadata(COMMAND_HANDLER_METADATA, HandlerClass)

  if (!commandClass) {
    throw new Error(`Handler ${HandlerClass.name} is not decorated with @CommandHandler`)
  }

  // Get command metadata (including unique ID)
  const commandMetadata = Reflect.getMetadata(COMMAND_METADATA, commandClass)

  if (!commandMetadata) {
    throw new Error(`Command ${commandClass.name} metadata not found`)
  }

  // Register the handler with the CommandBus using lazy loading
  commandBus.registerHandler(commandClass, HandlerClass, filePath)
}
