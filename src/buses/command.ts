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
import { COMMAND_HANDLER_METADATA, COMMAND_METADATA } from '../decorators/constants.js'
import { Type } from '../types/shared.js'
import { CommandHandlerNotFoundException } from '../errors/command_handler_not_found.js'
import { Logger } from '@adonisjs/core/logger'

type HandlerRegistration = {
  filePath: string
  commandName: string // Store command name for logging purposes
  handlerName: string // Store handler name for logging purposes
}

export type CommandHandlerType<T extends BaseCommand = BaseCommand> = Type<BaseCommandHandler<T>>

export class CommandBus<TCommand extends BaseCommand = BaseCommand>
  extends ObservableBus<TCommand>
  implements BaseCommandBus<TCommand>
{
  #publisher: BaseCommandPublisher<TCommand>
  #app: Application<any>
  #logger: Logger
  #config: CqrsConfig
  #handlers: Map<string, HandlerRegistration> = new Map()

  constructor(app: Application<any>, logger: Logger, config: CqrsConfig) {
    super()

    this.#app = app
    this.#logger = logger
    this.#config = config

    if (this.#config?.publishers?.commands) {
      this.#publisher = this.#config.publishers.commands
    } else {
      this.#publisher = new DefaultCommandPubSub<TCommand>(this.subject$)
    }
  }

  public async dispatch<T extends TCommand>(
    command: T
  ): Promise<T extends Command<infer R> ? R : any> {
    // Use the new method to get command ID
    const commandId = this.getCommandId(command)
    const commandName = this.getCommandName(command)

    // Find the handler registration using command ID
    const registration = this.#handlers.get(commandId)

    if (!registration) {
      throw new CommandHandlerNotFoundException(commandName)
    }

    try {
      // Lazy load the handler module if not already loaded
      const handlerModule = await import(registration.filePath)
      const HandlerClass = handlerModule.default

      // Instantiate the handler with dependency injection
      const handler = await this.#app.container.make(HandlerClass)

      // Execute the command
      const result = await handler.execute(command)

      // Publish the command for observability
      this.#publisher.publish(command)

      return result
    } catch (error) {
      this.#logger.error(`[CQRS] Error executing command ${commandName}:`, error)
      throw error
    }
  }

  /**
   * Registers a command handler with lazy loading support
   */
  public registerHandler(
    commandClass: new (...args: any[]) => BaseCommand,
    handlerClass: new (...args: any[]) => BaseCommandHandler,
    filePath: string
  ): void {
    const commandName = commandClass.name
    const commandId = this.reflectCommandId(handlerClass as CommandHandlerType)

    if (!commandId) {
      throw new Error(`Command ID not found for ${commandName}`)
    }

    // Store using command ID as key for better uniqueness and consistency
    this.#handlers.set(commandId, {
      filePath,
      commandName, // Store command name for logging purposes
      handlerName: handlerClass.name,
    })

    this.#logger.debug(
      `[CQRS] Registered handler ${handlerClass.name} for command ${commandName} (ID: ${commandId})`
    )
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

  private reflectCommandId(handler: CommandHandlerType): string | undefined {
    const command: Type<BaseCommand> = Reflect.getMetadata(COMMAND_HANDLER_METADATA, handler)
    const commandMetadata = Reflect.getMetadata(COMMAND_METADATA, command)
    return commandMetadata.id
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
   * Gets all registered command handlers
   */
  public getRegisteredHandlers(): Array<{
    commandId: string
    commandName: string
    handlerName: string
    filePath: string
  }> {
    return Array.from(this.#handlers.entries()).map(([commandId, registration]) => ({
      commandId,
      commandName: registration.commandName,
      handlerName: registration.handlerName,
      filePath: registration.filePath,
    }))
  }

  /**
   * Gets handler information for a specific command
   */
  public getHandlerInfo(
    command: TCommand
  ): { commandId: string; commandName: string; handlerName: string; filePath: string } | null {
    const commandId = this.getCommandId(command)
    const registration = this.#handlers.get(commandId)

    if (!registration) {
      return null
    }

    return {
      commandId,
      commandName: registration.commandName,
      handlerName: registration.handlerName,
      filePath: registration.filePath,
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
