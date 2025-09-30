import { test } from '@japa/runner'
import { setupApp } from '../helpers.js'
import MakeCommand from '../../commands/make_command.js'
import { generators } from '../../src/generators.js'

test.group('MakeCommand', () => {
  test('create command and handler files', async ({ assert }) => {
    const { ace, prepareStub, app } = await setupApp()

    const name = 'users/create_user'
    const command = await ace.create(MakeCommand, [name])
    await command.exec()

    const commandPath = 'app/commands/users/create_user_command.ts'
    const handlerPath = 'app/handlers/users/create_user_handler.ts'

    const { contents: commandContents } = await prepareStub('make/command.stub', {
      entity: app.generators.createEntity(name),
      baseDir: app.rcFile.directories['cqrs.commands'],
      generators,
    })

    const { contents: handlerContents } = await prepareStub('make/command_handler.stub', {
      entity: app.generators.createEntity(name),
      baseDir: app.rcFile.directories['cqrs.handlers'],
      generators,
    })

    await assert.fileExists(commandPath)
    await assert.fileExists(handlerPath)
    await assert.fileEquals(commandPath, commandContents)
    await assert.fileEquals(handlerPath, handlerContents)
  })

  test('create command and handler in a custom directory', async ({ assert }) => {
    const { ace, prepareStub, app } = await setupApp()

    const name = 'create_order'
    const command = await ace.create(MakeCommand, [name, '-d', 'orders'])
    await command.exec()

    const commandPath = 'orders/commands/create_order_command.ts'
    const handlerPath = 'orders/handlers/create_order_handler.ts'

    const { contents: commandContents } = await prepareStub('make/command.stub', {
      entity: app.generators.createEntity(name),
      baseDir: app.rcFile.directories['cqrs.commands'],
      generators,
    })

    const { contents: handlerContents } = await prepareStub('make/command_handler.stub', {
      entity: app.generators.createEntity(name),
      baseDir: app.rcFile.directories['cqrs.handlers'],
      generators,
    })

    await assert.fileExists(commandPath)
    await assert.fileExists(handlerPath)
    await assert.fileEquals(commandPath, commandContents)
    await assert.fileEquals(handlerPath, handlerContents)
  })

  test('skip when command and handler already exist', async ({ assert, fs }) => {
    const { ace } = await setupApp()
    ace.ui.switchMode('raw')

    const name = 'existing_file'
    const commandPath = 'app/commands/existing_file_command.ts'
    const handlerPath = 'app/handlers/existing_file_handler.ts'

    await fs.create(commandPath, '// Existing command file')
    await fs.create(handlerPath, '// Existing handler file')

    const command = await ace.create(MakeCommand, [name])
    await command.exec()

    await assert.fileEquals(commandPath, '// Existing command file')
    await assert.fileEquals(handlerPath, '// Existing handler file')

    assert.deepEqual(ace.ui.logger.getLogs(), [
      {
        message: `cyan(SKIPPED:) create ${commandPath.replace(
          /\\/g,
          '/'
        )} dim((File already exists))`, // Corrected escaping for backslash
        stream: 'stdout',
      },
      {
        message: `cyan(SKIPPED:) create ${handlerPath.replace(
          /\\/g,
          '/'
        )} dim((File already exists))`, // Corrected escaping for backslash
        stream: 'stdout',
      },
    ])
  })
})
