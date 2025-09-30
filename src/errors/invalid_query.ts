export class InvalidQueryException extends Error {
  constructor() {
    super('The executed object is not a valid query. It must be an instance of the Query class.')
  }
}
