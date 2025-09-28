export class InvalidCommandException extends Error {
  constructor() {
    super(
      'The dispatched object is not a valid command. It must be an instance of the Command class.'
    )
  }
}
