import 'reflect-metadata'
import { Logger } from '@adonisjs/core/logger'
import { Type } from '../types/shared.js'
import { METADATA_MAP } from '../decorators/constants.js'
import { DuplicateCommandHandlerException } from '../errors/main.js'

export const HANDLER_TYPES = ['command', 'query', 'event'] as const
export type HandlerType = (typeof HANDLER_TYPES)[number]

export type HandlerRegistration = {
  filePath: string
  subjectName: string
  handlerName: string
}

export class HandlersManager {
  #storage: Record<HandlerType, Map<string, HandlerRegistration>>
  #logger: Logger

  constructor(logger: Logger) {
    this.#logger = logger
    this.#storage = {} as Record<HandlerType, Map<string, HandlerRegistration>>
    HANDLER_TYPES.forEach((type) => {
      this.#storage[type] = new Map()
    })
  }

  public registerHandler(
    type: keyof typeof METADATA_MAP,
    subjectClass: new (...args: any[]) => any,
    handlerClass: new (...args: any[]) => any,
    filePath: string
  ): void {
    const subjectId = this.reflectSubjectId(type, handlerClass)
    const subjectName = subjectClass.name

    if (!subjectId) {
      this.#logger.warn(`ID not found for ${subjectName}. Cannot register handler.`)
      return
    }

    if (this.#storage[type].has(subjectId)) {
      throw new DuplicateCommandHandlerException(subjectId)
    }

    this.#storage[type].set(subjectId, {
      filePath,
      subjectName,
      handlerName: handlerClass.name,
    })

    this.#logger.debug(
      `[HandlersManager] Registered ${type} handler ${handlerClass.name} for ${subjectName} (ID: ${subjectId})`
    )
  }

  public getHandler(type: HandlerType, subjectId: string): HandlerRegistration | undefined {
    return this.#storage[type]?.get(subjectId)
  }

  public getRegisteredHandlers(): {
    command: HandlerRegistration[]
    query: HandlerRegistration[]
    event: HandlerRegistration[]
    total: number
  }
  public getRegisteredHandlers(type: HandlerType): HandlerRegistration[]
  public getRegisteredHandlers(type?: HandlerType): any {
    if (!type) {
      return {
        command: this.getRegisteredHandlers('command'),
        query: this.getRegisteredHandlers('query'),
        event: this.getRegisteredHandlers('event'),
        get total(): number {
          return this.command.length + this.query.length + this.event.length
        },
      }
    }

    const handlerMap = this.#storage[type]
    if (!handlerMap) {
      return []
    }
    return Array.from(handlerMap.entries()).map(([subjectId, registration]) => ({
      subjectId,
      ...registration,
    }))
  }

  private reflectSubjectId(
    type: keyof typeof METADATA_MAP,
    handler: Type<any>
  ): string | undefined {
    const keys = METADATA_MAP[type]

    const subject: Type<any> = Reflect.getMetadata(keys.handler, handler)
    if (!subject) {
      return undefined
    }

    const metadata = Reflect.getMetadata(keys.subject, subject)
    return metadata?.id
  }
}
