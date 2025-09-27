import { test } from '@japa/runner'
import { setupApp } from '../helpers.js'
import MakeCommand from '../../commands/make_command.js'

test.group('MakeCommand', () => {
  test('create command and handler files', async ({ assert }) => {
    const { ace, prepareStub } = await setupApp()

    const command = await ace.create(MakeCommand, ['create_user'])
    await command.exec()

    const name = 'create_user'
    const destinationDir = `app/commands/${name}`

    const commandPath = `${destinationDir}/create_user_command.ts`
    const handlerPath = `${destinationDir}/create_user_handler.ts`

    const { contents: commandContents } = await prepareStub('make/command.stub', {
      name,
      destinationDir,
    })

    const { contents: handlerContents } = await prepareStub('make/command_handler.stub', {
      name,
      destinationDir,
    })

    await assert.fileExists(commandPath)
    await assert.fileExists(handlerPath)
    await assert.fileEquals(commandPath, commandContents)
    await assert.fileEquals(handlerPath, handlerContents)
  })

  test('create command and handler in a custom directory', async ({ assert }) => {
    const { ace, prepareStub } = await setupApp()

    const command = await ace.create(MakeCommand, ['create_order', '-d', 'orders'])
    await command.exec()

    const name = 'create_order'
    const destinationDir = `app/orders/commands/${name}`

    const commandPath = `${destinationDir}/create_order_command.ts`
    const handlerPath = `${destinationDir}/create_order_handler.ts`

    const { contents: commandContents } = await prepareStub('make/command.stub', {
      name,
      destinationDir,
    })

    const { contents: handlerContents } = await prepareStub('make/command_handler.stub', {
      name,
      destinationDir,
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
    const destinationDir = `app/commands/${name}`
    const commandPath = `${destinationDir}/existing_file_command.ts`
    const handlerPath = `${destinationDir}/existing_file_handler.ts`

    await fs.create(commandPath, `// Existing command file`)
    await fs.create(handlerPath, `// Existing handler file`)

    const command = await ace.create(MakeCommand, [name])
    await command.exec()

    await assert.fileEquals(commandPath, `// Existing command file`)
    await assert.fileEquals(handlerPath, `// Existing handler file`)

    assert.deepEqual(ace.ui.logger.getLogs(), [
      {
        message: `cyan(SKIPPED:) create ${commandPath.replace(
          /\\/g,
          '/'
        )} dim((File already exists))`,
        stream: 'stdout',
      },
      {
        message: `cyan(SKIPPED:) create ${handlerPath.replace(
          /\\/g,
          '/'
        )} dim((File already exists))`,
        stream: 'stdout',
      },
    ])
  })
})
