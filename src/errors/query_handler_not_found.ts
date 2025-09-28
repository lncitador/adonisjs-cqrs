export class QueryHandlerNotFoundException extends Error {
  constructor(queryName: string) {
    super(`Query handler not found for query ${queryName}`)
  }
}
