export class CommandHandlerNotFoundException extends Error {
  constructor(commandName: string) {
    super(`Command handler not found for command ${commandName}`)
  }
}
