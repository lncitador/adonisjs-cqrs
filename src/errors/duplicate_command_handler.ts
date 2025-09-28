export class DuplicateCommandHandlerException extends Error {
  constructor(commandId: string) {
    super(`A handler for the command with ID "${commandId}" has already been registered.`)
  }
}
