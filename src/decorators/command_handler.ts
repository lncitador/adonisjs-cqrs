import 'reflect-metadata'
import { BaseCommand } from '../types/command.js'
import { COMMAND_HANDLER_METADATA, COMMAND_METADATA } from './constants.js'
import { randomUUID } from 'node:crypto'

export const CommandHandler = (
  command: BaseCommand | (new (...args: any[]) => BaseCommand)
): ClassDecorator => {
  return (target: Function) => {
    if (!Reflect.hasOwnMetadata(COMMAND_METADATA, command)) {
      Reflect.defineMetadata(COMMAND_METADATA, { id: randomUUID() }, command)
    }

    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target)
  }
}
