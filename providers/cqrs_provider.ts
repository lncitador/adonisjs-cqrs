import { Application } from '@adonisjs/core/app'
import { CommandBus } from '../src/buses/command.js'
import { QueryBus } from '../src/buses/query.js'
import { discoverHandlers } from '../src/core/discovery.js'
import { CqrsConfig } from '../src/types/config.js'
import { Logger } from '@adonisjs/core/logger'
import { HandlersManager } from '../src/storages/handlers_manager.js'
import { METADATA_MAP } from '../src/decorators/constants.js'
import { debug } from '../src/debug.js'

export default class CqrsProvider {
  #config: CqrsConfig

  constructor(protected app: Application<any>) {
    this.#config = this.app.config.get<CqrsConfig>('cqrs')
  }

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton(HandlersManager, async (resolver) => {
      const logger = await resolver.make(Logger)
      return new HandlersManager(logger)
    })

    this.app.container.singleton(CommandBus, async (resolver) => {
      const logger = await resolver.make(Logger)
      const handlersManager = await resolver.make(HandlersManager)
      return new CommandBus(this.app, handlersManager, logger, this.#config)
    })

    this.app.container.singleton(QueryBus, async (resolver) => {
      const logger = await resolver.make(Logger)
      const handlersManager = await resolver.make(HandlersManager)
      return new QueryBus(this.app, handlersManager, logger, this.#config)
    })
  }

  /**
   * The application has been booted
   */
  async boot() {
    const handlersManager = await this.app.container.make(HandlersManager)

    for await (const { HandlerClass, filePath } of discoverHandlers(this.app)) {
      let registered = false

      const commandMetadataKey = METADATA_MAP.command.handler
      const commandClass = Reflect.getMetadata(commandMetadataKey, HandlerClass)
      if (commandClass) {
        handlersManager.registerHandler('command', commandClass, HandlerClass, filePath)
        debug(
          `[CQRS] Registered command handler %s for command %s`,
          HandlerClass.name,
          commandClass.name
        )
        registered = true
      }

      const queryMetadataKey = METADATA_MAP.query.handler
      const queryClass = Reflect.getMetadata(queryMetadataKey, HandlerClass)
      if (queryClass) {
        handlersManager.registerHandler('query', queryClass, HandlerClass, filePath)
        debug(`[CQRS] Registered query handler %s for query %s`, HandlerClass.name, queryClass.name)
        registered = true
      }

      if (!registered) {
        debug(
          `[CQRS] Handler %s from %s is not decorated with a valid @CommandHandler or @QueryHandler decorator.`,
          HandlerClass.name,
          filePath
        )
      }
    }
  }

  async ready() {
    const handlersManager = await this.app.container.make(HandlersManager)
    debug(
      `[CQRS] A total of %d handlers were registered.`,
      handlersManager.getRegisteredHandlers().total
    )
  }
}
