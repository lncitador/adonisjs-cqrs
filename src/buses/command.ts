import 'reflect-metadata'
import { Application } from '@adonisjs/core/app'
import { Command } from '../core/command.js'
import { DefaultCommandPubSub } from '../pubsub/command.js'
import {
  BaseCommand,
  BaseCommandBus,
  BaseCommandPublisher,
  BaseCommandHandler,
} from '../types/command.js'
import { ObservableBus } from './observable.js'
import { CqrsConfig } from '../types/config.js'
import { COMMAND_METADATA } from '../decorators/constants.js'
import { Type } from '../types/shared.js'
import { CommandHandlerNotFoundException } from '../errors/command_handler_not_found.js'
import { Logger } from '@adonisjs/core/logger'
import { HandlersManager } from '../storages/handlers_manager.js'
import { InvalidCommandException } from '../errors/invalid_command.js'
import { UNSAFE } from '../define_config.js'

export type CommandHandlerType<T extends BaseCommand = BaseCommand> = Type<BaseCommandHandler<T>>

export class CommandBus<TCommand extends BaseCommand = BaseCommand>
  extends ObservableBus<TCommand>
  implements BaseCommandBus<TCommand>
{
  #publisher: BaseCommandPublisher<TCommand>
  #app: Application<any>
  #logger: Logger
  #config: CqrsConfig
  #handlersManager: HandlersManager
  #unsafe: boolean

  constructor(
    app: Application<any>,
    handlersManager: HandlersManager,
    logger: Logger,
    config: CqrsConfig
  ) {
    super()

    this.#app = app
    this.#handlersManager = handlersManager
    this.#logger = logger
    this.#config = config

    this.#unsafe = config[UNSAFE] || false

    if (this.#config?.publishers?.commands) {
      this.#publisher = this.#config.publishers.commands
    } else {
      this.#publisher = new DefaultCommandPubSub<TCommand>(this.subject$)
    }
  }

  public async dispatch<T extends TCommand>(
    command: T
  ): Promise<T extends Command<infer R> ? R : any> {
    if (!(command instanceof Command) && !this.#unsafe) {
      throw new InvalidCommandException()
    }

    const commandId = this.getCommandId(command)
    const commandName = this.getCommandName(command)

    const registration = this.#handlersManager.getHandler('command', commandId)

    if (!registration) {
      throw new CommandHandlerNotFoundException(commandName)
    }

    try {
      const handlerModule = await import(registration.filePath)
      const HandlerClass = handlerModule.default

      const handler: BaseCommandHandler = await this.#app.container.make(HandlerClass)

      const result = await handler.handle(command)

      this.#publisher.publish(command)

      return result
    } catch (error) {
      this.#logger.error(`[CQRS] Error executing command ${commandName}:`, error)
      throw error
    }
  }

  public getHandlers() {
    return this.#handlersManager.getRegisteredHandlers('command')
  }

  private getCommandId(command: TCommand): string {
    const { constructor: commandType } = Object.getPrototypeOf(command)
    const commandMetadata = Reflect.getMetadata(COMMAND_METADATA, commandType)
    if (!commandMetadata) {
      throw new CommandHandlerNotFoundException(commandType.name)
    }

    return commandMetadata.id
  }

  private getCommandName(command: TCommand): string {
    const { constructor } = Object.getPrototypeOf(command)
    return constructor.name as string
  }

  /**
   * Gets command information including ID and name
   */
  public getCommandInfo(command: TCommand): { id: string; name: string } {
    return {
      id: this.getCommandId(command),
      name: this.getCommandName(command),
    }
  }

  /**
   * Returns the publisher.
   * Default publisher is `DefaultCommandPubSub` (in memory).
   */
  get publisher(): BaseCommandPublisher<TCommand> {
    return this.#publisher
  }

  /**
   * Sets the publisher.
   * Default publisher is `DefaultCommandPubSub` (in memory).
   * @param publisher The publisher to set.
   */
  set publisher(publisher: BaseCommandPublisher<TCommand>) {
    this.#publisher = publisher
  }
}
