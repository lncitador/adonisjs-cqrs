import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { stubsRoot } from '../stubs/main.js'
import { CqrsConfig } from '../src/types/config.js'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class MakeCommand extends BaseCommand {
  static commandName = 'make:command'
  static description = 'Create a new CQRS command and handler'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Name of the command' })
  declare name: string

  @flags.boolean({
    description: 'Create the corresponding command handler as well',
    alias: 'h',
    default: true,
    required: false,
  })
  declare handler?: boolean

  @flags.string({
    description: 'The domain directory to create the command in',
    alias: 'd',
    required: false,
  })
  declare directory?: string

  async run() {
    const codemods = await this.createCodemods()
    const config: CqrsConfig = this.app.config.get('cqrs')
    const root = config.generator.root

    const baseDir = this.directory ? `${root}/${this.directory}` : root
    const destinationDir = `${baseDir}/commands/${this.name}`

    await codemods.makeUsingStub(stubsRoot, 'make/command.stub', {
      name: this.name,
      destinationDir: destinationDir,
    })

    if (this.handler) {
      await this.createHandler(destinationDir)
    }
  }

  private async createHandler(destinationDir: string) {
    const codemods = await this.createCodemods()

    await codemods.makeUsingStub(stubsRoot, 'make/command_handler.stub', {
      name: this.name,
      destinationDir: destinationDir,
    })
  }
}
