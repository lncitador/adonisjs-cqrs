import { Application } from '@adonisjs/core/app'
import { CommandBus } from '../src/buses/command.js'
import { discoverCommandHandlers } from '../src/core/discovery.js'
import { CqrsConfig } from '../src/types/config.js'
import { Logger } from '@adonisjs/core/logger'

export default class CqrsProvider {
  #config: CqrsConfig

  constructor(protected app: Application<any>) {
    this.#config = this.app.config.get<CqrsConfig>('cqrs')
  }

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton(CommandBus, async (resolver) => {
      const logger = await resolver.make(Logger)
      return new CommandBus(this.app, logger, this.#config)
    })
  }

  /**
   * The application has been booted
   */
  async boot() {
    const commandBus = await this.app.container.make(CommandBus)
    const logger = await this.app.container.make(Logger)

    await discoverCommandHandlers(this.app, logger, this.#config, commandBus)
  }
}
