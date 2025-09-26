import { Command } from '../core/command.js'

export interface BaseCommand {}

export interface BaseCommandBus<TCommand extends BaseCommand = BaseCommand> {
  /**
   * Dispatches a command.
   * @param command The command to execute.
   * @returns A promise that, when resolved, will contain the result returned by the command's handler.
   */
  dispatch<T extends TCommand>(command: T): Promise<T extends Command<infer R> ? R : any>
}

export type BaseCommandHandler<TCommand extends BaseCommand = any, TResult = any> =
  TCommand extends Command<infer InferredCommandResult>
    ? {
        /**
         * Executes a command.
         * @param command The command to execute.
         */
        execute(command: TCommand): Promise<InferredCommandResult>
      }
    : {
        /**
         * Executes a command.
         * @param command The command to execute.
         */
        execute(command: TCommand): Promise<TResult>
      }

export interface BaseCommandPublisher<CommandBase extends BaseCommand = BaseCommand> {
  /**
   * Publishes a command.
   * @param command The command to publish.
   */
  publish<T extends CommandBase = CommandBase>(command: T): any
}
