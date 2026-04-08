import { type Subject } from 'rxjs'
import { type BaseQuery, type BaseQueryPublisher } from '../types/query.js'

export class DefaultQueryPubSub<T extends BaseQuery> implements BaseQueryPublisher<T> {
  constructor(private subject$: Subject<T>) {}

  publish(query: T) {
    this.subject$.next(query)
  }
}
