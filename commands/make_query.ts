import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { stubsRoot } from '../stubs/main.js'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { generators } from '../src/generators.js'

export default class MakeQuery extends BaseCommand {
  static commandName = 'make:cqrs:query'
  static description = 'Create a new CQRS query and handler'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Name of the query' })
  declare name: string

  @flags.boolean({
    description: 'Create only the query',
    alias: 'o',
    default: false,
    required: false,
  })
  declare queryOnly?: boolean

  @flags.string({
    description: 'The domain directory to create the query in',
    alias: 'd',
    required: false,
  })
  declare directory?: string

  async run() {
    const codemods = await this.createCodemods()
    const root = this.app.rcFile.directories['cqrs.queries']
    const baseDir = this.directory ? `${this.directory}/queries` : root

    await codemods.makeUsingStub(stubsRoot, 'make/query.stub', {
      entity: this.app.generators.createEntity(this.name),
      generators,
      baseDir,
    })

    if (!this.queryOnly) {
      await this.createHandler()
    }
  }

  private async createHandler() {
    const codemods = await this.createCodemods()
    const root = this.app.rcFile.directories['cqrs.handlers']
    const baseDir = this.directory ? `${this.directory}/handlers` : root

    await codemods.makeUsingStub(stubsRoot, 'make/query_handler.stub', {
      entity: this.app.generators.createEntity(this.name),
      generators,
      baseDir,
    })
  }
}
