import { BaseCommand, flags } from '@adonisjs/core/ace'
import { HandlersManager } from '../src/storages/handlers_manager.js'
import { HandlerRegistration } from '../src/storages/handlers_manager.js'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class ListHandlers extends BaseCommand {
  static commandName = 'list:handlers'
  static description = 'List all registered CQRS command and query handlers'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({
    description: 'Output the list as JSON',
    alias: 'j',
    default: false,
  })
  declare json: boolean

  async run() {
    const handlersManager = await this.app.container.make(HandlersManager)
    const registeredHandlers = handlersManager.getRegisteredHandlers()

    if (this.json) {
      this.logger.log(JSON.stringify(registeredHandlers, null, 2))
      return
    }

    this.logger.info('Registered CQRS Handlers:')

    const table = this.ui.table()
    table.head(['Type', 'Subject Name', 'Handler Name', 'File Path'])

    registeredHandlers.command.forEach((handler: HandlerRegistration) => {
      table.row([
        this.ui.colors.cyan('COMMAND'),
        this.ui.colors.yellow(handler.subjectName),
        this.ui.colors.cyan(handler.handlerName),
        this.ui.colors.dim(handler.filePath),
      ])
    })

    registeredHandlers.query.forEach((handler: HandlerRegistration) => {
      table.row([
        this.ui.colors.green('QUERY'),
        this.ui.colors.yellow(handler.subjectName),
        this.ui.colors.cyan(handler.handlerName),
        this.ui.colors.dim(handler.filePath),
      ])
    })

    // If event handlers are ever implemented, they would go here
    // registeredHandlers.event.forEach((handler: HandlerRegistration) => {
    //   table.row([
    //     this.ui.colors.magenta('EVENT'),
    //     this.ui.colors.yellow(handler.subjectName),
    //     this.ui.colors.cyan(handler.handlerName),
    //     this.ui.colors.dim(handler.filePath),
    //   ])
    // })

    table.render()

    this.logger.info(`Total handlers registered: ${registeredHandlers.total}`)
  }
}
