import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import MakeCommand from './make_command.js'
import MakeQuery from './make_query.js'

export default class MakeHandler extends BaseCommand {
  static commandName = 'make:cqrs:handler'
  static description = 'Create a new CQRS handler for an existing command or query'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
  }

  @args.string({ description: 'Name of the command/query for the handler' })
  declare name: string

  @flags.boolean({
    description: 'Define that the handler is for a command',
    alias: 'c',
    required: false,
  })
  declare command?: boolean

  @flags.boolean({
    description: 'Define that the handler is for a query',
    alias: 'q',
    required: false,
  })
  declare query?: boolean

  @flags.string({
    description: 'The domain directory to create the handler in',
    alias: 'd',
  })
  declare directory?: string

  async run() {
    const { default: ace } = await import('@adonisjs/core/services/ace')
    await ace.boot()
    let type: 'command' | 'query'

    if (this.command && this.query) {
      this.logger.error('Cannot use both --command and --query flags at the same time.')
      this.exitCode = 1
      return
    }

    if (this.command) {
      type = 'command'
    } else if (this.query) {
      type = 'query'
    } else {
      type = await this.prompt.choice('Select the handler type', ['command', 'query'])
    }

    const commandToRun = type === 'command' ? MakeCommand : MakeQuery
    const commandArgs = [this.name]

    if (this.directory) {
      commandArgs.push('-d', this.directory)
    }

    const command = await ace.create(commandToRun, commandArgs)
    await command.exec()
  }
}
