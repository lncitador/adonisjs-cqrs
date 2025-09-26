import { Subject } from 'rxjs'
import { BaseCommand, BaseCommandPublisher } from '../types/command.js'

export class DefaultCommandPubSub<TCommand extends BaseCommand>
  implements BaseCommandPublisher<TCommand>
{
  constructor(private subject$: Subject<TCommand>) {}

  publish<T extends TCommand>(command: T) {
    this.subject$.next(command)
  }
}
