import { AppFactory } from '@adonisjs/application/factories'
import { CommandBus } from '../src/buses/command.js'
import { Application } from '@adonisjs/core/app'
import { CqrsConfig } from '../src/types/config.js'
import { Logger } from '@adonisjs/core/logger'
import { defineConfig } from '../src/define_config.js'
import { HandlersManager } from '../src/storages/handlers_manager.js'

type FactoryParameters = {
  app: Application<any>
  logger: Logger
  config: CqrsConfig
  handlersManager: HandlersManager
}

export class CommandBusFactory {
  /**
   * Factory parameters for creating server instances
   */
  #parameters: Partial<FactoryParameters> = {}

  /**
   * Returns the logger instance
   */
  #getLogger() {
    return this.#parameters.logger || new Logger({ enabled: false })
  }

  /**
   * Returns the config for the server class
   */
  #getConfig() {
    return defineConfig(this.#parameters.config || {})
  }

  /**
   * Returns an instance of the application class
   */
  #getApp() {
    return this.#parameters.app || new AppFactory().create(new URL('./app/', import.meta.url))
  }

  /**
   * Returns an instance of the HandlersManager class
   */
  #getHandlersManager() {
    return this.#parameters.handlersManager || new HandlersManager(this.#getLogger())
  }

  /**
   * Merge factory params
   * @param params - Partial factory parameters to merge
   */
  merge(params: Partial<FactoryParameters>) {
    Object.assign(this.#parameters, params)
    return this
  }

  create() {
    return new CommandBus(
      this.#getApp(),
      this.#getHandlersManager(),
      this.#getLogger(),
      this.#getConfig()
    )
  }
}
