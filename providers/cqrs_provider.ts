import { Application } from '@adonisjs/core/app'
import { CommandBus } from '../src/buses/command.js'
import { QueryBus } from '../src/buses/query.js'
import { discoverHandlers } from '../src/core/discovery.js'
import { CqrsConfig } from '../src/types/config.js'
import { Logger } from '@adonisjs/core/logger'
import { HandlersManager } from '../src/storages/handlers_manager.js'

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
    const logger = await this.app.container.make(Logger)

    await discoverHandlers(this.app, logger, this.#config, handlersManager, 'command')
    await discoverHandlers(this.app, logger, this.#config, handlersManager, 'query')
  }
}
