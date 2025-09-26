import { test } from '@japa/runner'
import { BASE_URL, IMPORTER, setupApp } from './helpers.js'
import { IgnitorFactory } from '@adonisjs/core/factories'
import { defineConfig } from '../src/define_config.js'
import { CommandBus } from '../src/buses/command.js'
import MakeCommand from '../commands/make_command.js'

test.group('QrpcProvider', async (group) => {
  group.setup(async () => {
    const { ace } = await setupApp()
    const createUserCommand = await ace.create(MakeCommand, ['create_user'])
    const createTodosCommand = await ace.create(MakeCommand, ['create_todos', '-d', 'todos'])
    await Promise.all([createUserCommand.exec(), createTodosCommand.exec()])
  })

  test('register command bus', async ({ assert, cleanup }) => {
    const ignitor = new IgnitorFactory()
      .merge({
        rcFileContents: {
          providers: [() => import('../providers/cqrs_provider.js')],
        },
      })
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          cqrs: defineConfig({}),
        },
      })
      .create(BASE_URL, { importer: IMPORTER })

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    cleanup(() => app.terminate())

    const commandBus = await app.container.make(CommandBus)

    assert.instanceOf(commandBus, CommandBus)

    const createTodosCommand = await import(
      // @ts-ignore
      './tmp/app/todos/commands/create_todos/create_todo_command.js'
    )

    assert.deepEqual(await commandBus.dispatch(new createTodosCommand.default()), { success: true })
  })
})
