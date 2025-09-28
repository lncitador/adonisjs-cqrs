import 'reflect-metadata'
import { QUERY_HANDLER_METADATA, QUERY_METADATA } from './constants.js'
import { randomUUID } from 'node:crypto'
import { BaseQuery } from '../types/query.js'

export const QueryHandler = (
  query: BaseQuery | (new (...args: any[]) => BaseQuery)
): ClassDecorator => {
  return (target: object) => {
    if (!Reflect.hasMetadata(QUERY_METADATA, query)) {
      Reflect.defineMetadata(QUERY_METADATA, { id: randomUUID() }, query)
    }
    Reflect.defineMetadata(QUERY_HANDLER_METADATA, query, target)
  }
}
