import { BaseCommandPublisher } from './command.js'
import { BaseQueryPublisher } from './query.js'

export type DirectoryType = 'command' | 'query'

export type CqrsConfig = {
  directories: Record<DirectoryType, string | string[]>
  publishers?: {
    commands?: BaseCommandPublisher
    queries?: BaseQueryPublisher
  }
  generator: {
    root: string
  }
}
