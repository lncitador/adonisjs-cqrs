import { Observable, Subject } from 'rxjs'

export class ObservableBus<T> extends Observable<T> {
  protected _subject$ = new Subject<T>()

  constructor() {
    super((subscriber) => {
      const subscription = this._subject$.subscribe(subscriber)
      return () => subscription.unsubscribe()
    })
  }

  public get subject$() {
    return this._subject$
  }

  public next(value: T): void {
    this._subject$.next(value)
  }

  public error(error: any): void {
    this._subject$.error(error)
  }

  public complete(): void {
    this._subject$.complete()
  }
}
