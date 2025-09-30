import { test } from '@japa/runner'
import { setupApp } from '../helpers.js'
import MakeHandler from '../../commands/make_handler.js'

test.group('MakeHandler', () => {
  test('create a new handler for a command', async ({ assert, fs }) => {
    const { ace } = await setupApp()

    await fs.create('app/commands/users/create_user_command.ts', `// Existing handler file`)

    const command = await ace.create(MakeHandler, ['users/create_user', '--command'])
    await command.exec()

    await assert.fileExists('app/handlers/users/create_user_handler.ts')
    await assert.fileContains(
      'app/handlers/users/create_user_handler.ts',
      '@CommandHandler(CreateUserCommand)'
    )
  })

  test('create a new handler for a query', async ({ fs, assert }) => {
    const { ace } = await setupApp()

    await fs.create('app/queries/users/get_user_query.ts', `// Existing query file`)

    const command = await ace.create(MakeHandler, ['users/get_user', '--query'])
    await command.exec()

    await assert.fileExists('app/handlers/users/get_user_handler.ts')
    await assert.fileContains(
      'app/handlers/users/get_user_handler.ts',
      '@QueryHandler(GetUserQuery)'
    )
  })

  test('create handler in a custom directory', async ({ fs, assert }) => {
    const { ace } = await setupApp()

    const command = await ace.create(MakeHandler, [
      'orders/create_order',
      '--command',
      '-d',
      'custom',
    ])
    await command.exec()

    await assert.fileExists('custom/handlers/orders/create_order_handler.ts')
  })

  test('should prompt for handler type if no flag is provided', async ({ assert }) => {
    const { ace } = await setupApp()

    const command = await ace.create(MakeHandler, ['users/create_user'])
    command.prompt.trap('Select the handler type').chooseOption(1)

    await command.exec()

    await assert.fileExists('app/handlers/users/create_user_handler.ts')
    await assert.fileContains(
      'app/handlers/users/create_user_handler.ts',
      '@CommandHandler(CreateUserCommand)'
    )
  })

  test('should fail if both --command and --query flags are used', async ({ assert }) => {
    const { ace } = await setupApp()
    ace.ui.switchMode('raw')

    const command = await ace.create(MakeHandler, ['users/create_user', '--command', '--query'])
    await command.exec()

    assert.equal(command.exitCode, 1)
    assert.deepInclude(ace.ui.logger.getLogs().at(0), {
      message: '[ red(error) ] Cannot use both --command and --query flags at the same time.',
      stream: 'stderr',
    })
  })
})
