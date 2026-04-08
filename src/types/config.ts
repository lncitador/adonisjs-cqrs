import { type UNSAFE } from '../define_config.js'
import { type BaseCommandPublisher } from './command.js'
import { type BaseQueryPublisher } from './query.js'

export type CqrsConfig = {
  [UNSAFE]: boolean
  publishers?: {
    commands?: BaseCommandPublisher
    queries?: BaseQueryPublisher
  }
  generator: {
    root: string
  }
}
