import { BaseCommandPublisher } from './command.js'

type Directory = {
  commands: string[]
  // events: string[]
  // queries: string[]
}

type Publishers = {
  commands?: BaseCommandPublisher
  // events?: any
  // queries?: any
  // exceptions?: any
}

export interface CqrsConfig {
  directories: Directory
  publishers?: Publishers
  generator: {
    root: string
  }
}
