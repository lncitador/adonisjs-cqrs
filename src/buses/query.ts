import 'reflect-metadata'
import { Application } from '@adonisjs/core/app'
import { Query } from '../core/query.js'
import { DefaultQueryPubSub } from '../pubsub/query.js'
import { BaseQuery, BaseQueryBus, BaseQueryHandler, BaseQueryPublisher } from '../types/query.js'
import { ObservableBus } from './observable.js'
import { CqrsConfig } from '../types/config.js'
import { QUERY_METADATA } from '../decorators/constants.js'
import { Type } from '../types/shared.js'
import { QueryHandlerNotFoundException } from '../errors/query_handler_not_found.js'
import { Logger } from '@adonisjs/core/logger'
import { HandlersManager } from '../storages/handlers_manager.js'
import { InvalidQueryException } from '../errors/invalid_query.js'
import { UNSAFE } from '../define_config.js'

export type QueryHandlerType<T extends BaseQuery = BaseQuery> = Type<BaseQueryHandler<T>>

export class QueryBus<TQuery extends BaseQuery = BaseQuery>
  extends ObservableBus<TQuery>
  implements BaseQueryBus<TQuery>
{
  #publisher: BaseQueryPublisher<TQuery>
  #app: Application<any>
  #logger: Logger
  #config: CqrsConfig
  #handlersManager: HandlersManager
  #unsafe: boolean

  constructor(
    app: Application<any>,
    handlersManager: HandlersManager,
    logger: Logger,
    config: CqrsConfig
  ) {
    super()

    this.#app = app
    this.#handlersManager = handlersManager
    this.#logger = logger
    this.#config = config

    this.#unsafe = config[UNSAFE] || false

    if (this.#config?.publishers?.queries) {
      this.#publisher = this.#config.publishers.queries
    } else {
      this.#publisher = new DefaultQueryPubSub<TQuery>(this.subject$)
    }
  }

  public async execute<T extends TQuery>(query: T): Promise<T extends Query<infer R> ? R : any> {
    if (!(query instanceof Query) && !this.#unsafe) {
      throw new InvalidQueryException()
    }

    const queryId = this.getQueryId(query)
    const queryName = this.getQueryName(query)

    const registration = this.#handlersManager.getHandler('query', queryId)

    if (!registration) {
      throw new QueryHandlerNotFoundException(queryName)
    }

    try {
      const handlerModule = await import(registration.filePath)
      const HandlerClass = handlerModule.default

      const handler: BaseQueryHandler = await this.#app.container.make(HandlerClass)

      const result = await handler.handle(query)

      this.#publisher.publish(query)

      return result
    } catch (error) {
      this.#logger.error(`[CQRS] Error executing query ${queryName}:`, error)
      throw error
    }
  }

  private getQueryId(query: TQuery): string {
    const { constructor: queryType } = Object.getPrototypeOf(query)
    const queryMetadata = Reflect.getMetadata(QUERY_METADATA, queryType)
    if (!queryMetadata) {
      throw new QueryHandlerNotFoundException(queryType.name)
    }

    return queryMetadata.id
  }

  private getQueryName(query: TQuery): string {
    const { constructor } = Object.getPrototypeOf(query)
    return constructor.name as string
  }

  get publisher(): BaseQueryPublisher<TQuery> {
    return this.#publisher
  }

  set publisher(publisher: BaseQueryPublisher<TQuery>) {
    this.#publisher = publisher
  }
}
