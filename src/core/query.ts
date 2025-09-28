import { BaseQuery } from '../types/query.js'
import { RESULT_TYPE_SYMBOL } from './constants.js'

export class Query<T> implements BaseQuery {
  declare readonly [RESULT_TYPE_SYMBOL]: T
}
