import { UNSAFE } from '../define_config.js'
import { BaseCommandPublisher } from './command.js'
import { BaseQueryPublisher } from './query.js'

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
