import { Query } from '../core/query.js'

export interface BaseQuery {}

export interface BaseQueryBus<T extends BaseQuery = BaseQuery> {
  /**
   * Executes a query.
   * @param query The query to execute
   * @returns A promise that resolves to the result of the query
   */
  execute<TQuery extends T, TResult = any>(
    query: TQuery
  ): Promise<TQuery extends Query<infer R> ? R : TResult>
}

export type BaseQueryHandler<TQuery extends BaseQuery = BaseQuery, TResult = any> =
  TQuery extends Query<infer InferredQueryResult>
    ? {
        /**
         * Handles a query.
         * @param query The query to handle
         * @returns A promise that resolves to the result of the query
         */
        handle(query: TQuery): Promise<InferredQueryResult>
      }
    : {
        /**
         * Handles a query.
         * @param query The query to handle
         * @returns A promise that resolves to the result of the query
         */
        handle(query: TQuery): Promise<TResult>
      }

export interface BaseQueryPublisher<T extends BaseQuery = BaseQuery> {
  /**
   * Publishes a query.
   * @param query The query to publish
   */
  publish(query: T): void
}
