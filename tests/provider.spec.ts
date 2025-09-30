import { test } from '@japa/runner'
import { setupApp } from './helpers.js'
import { CommandBus } from '../src/buses/command.js'
import MakeCommand from '../commands/make_command.js'
import { QueryBus } from '../src/buses/query.js'
import MakeQuery from '../commands/make_query.js'

test.group('QrpcProvider', async (group) => {
  group.each.setup(async () => {
    const { ace } = await setupApp()
    const createUserCommand = await ace.create(MakeQuery, ['get_active_todos', '-d', 'todos'])
    const createTodosCommand = await ace.create(MakeCommand, ['create_todos', '-d', 'todos'])
    await Promise.all([createUserCommand.exec(), createTodosCommand.exec()])
  })

  test('register command bus', async ({ assert, cleanup }) => {
    const { app } = await setupApp()

    cleanup(() => app.terminate())

    const commandBus = await app.container.make(CommandBus)

    assert.instanceOf(commandBus, CommandBus)

    const createTodosCommand = await import(
      // @ts-ignore
      './tmp/todos/commands/create_todo_command.js'
    )

    assert.deepEqual(await commandBus.dispatch(new createTodosCommand.default()), { success: true })
  })

  test('register query bus', async ({ assert, cleanup }) => {
    const { app } = await setupApp()

    cleanup(() => app.terminate())

    const queryBus = await app.container.make(QueryBus)

    assert.instanceOf(queryBus, QueryBus)

    const getUserQuery = await import(
      // @ts-ignore
      './tmp/todos/queries/get_active_todo_query.js'
    )

    assert.deepEqual(await queryBus.execute(new getUserQuery.default()), { success: true })
  })
})
