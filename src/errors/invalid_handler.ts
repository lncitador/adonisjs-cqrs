export class InvalidHandlerException extends Error {
  constructor(handlerPath: string, reason: string) {
    super(`Invalid handler found at ${handlerPath}: ${reason}`)
  }
}
