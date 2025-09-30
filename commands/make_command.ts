import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { stubsRoot } from '../stubs/main.js'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { generators } from '../src/generators.js'

export default class MakeCommand extends BaseCommand {
  static commandName = 'make:cqrs:command'
  static description = 'Create a new CQRS command and handler'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Name of the command' })
  declare name: string

  @flags.boolean({
    description: 'Create only the command',
    alias: 'o',
    default: false,
    required: false,
  })
  declare commandOnly?: boolean

  @flags.string({
    description: 'The domain directory to create the command in',
    alias: 'd',
    required: false,
  })
  declare directory?: string

  async run() {
    const codemods = await this.createCodemods()
    const root = this.app.rcFile.directories['cqrs.commands']

    const baseDir = this.directory ? `${this.directory}/commands` : root

    await codemods.makeUsingStub(stubsRoot, 'make/command.stub', {
      entity: this.app.generators.createEntity(this.name),
      baseDir,
      generators,
    })

    if (!this.commandOnly) {
      await this.createHandler()
    }
  }

  private async createHandler() {
    const codemods = await this.createCodemods()
    const root = this.app.rcFile.directories['cqrs.handlers']
    const baseDir = this.directory ? `${this.directory}/handlers` : root

    await codemods.makeUsingStub(stubsRoot, 'make/command_handler.stub', {
      entity: this.app.generators.createEntity(this.name),
      baseDir,
      generators,
    })
  }
}
