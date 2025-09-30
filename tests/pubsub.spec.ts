import { test } from '@japa/runner'
import { setupApp } from './helpers.js'
import { CommandBus } from '../src/buses/command.js'
import MakeCommand from '../commands/make_command.js'
import { defineConfig, UNSAFE } from '../src/define_config.js'
import { BaseCommandPublisher } from '../src/types/command.js'
import MakeQuery from '../commands/make_query.js'
import { BaseQueryPublisher } from '../src/types/query.js'
import { QueryBus } from '../src/buses/query.js'

test.group('PubSub', (group) => {
  group.each.setup(async () => {
    const { ace } = await setupApp()
    const testCommand = await ace.create(MakeCommand, ['tests/create_test'])
    const testQuery = await ace.create(MakeQuery, ['tests/get_test'])
    await Promise.all([testCommand.exec(), testQuery.exec()])
  })

  test('should publish command to subject', async ({ assert }) => {
    const { app } = await setupApp()
    const commandBus = await app.container.make(CommandBus)

    const TestCommand = await import(
      // @ts-ignore
      './tmp/app/commands/tests/create_test_command.ts'
    )

    const command = new TestCommand.default()
    let receivedCommand: any

    commandBus.subject$.subscribe((cmd) => {
      receivedCommand = cmd
    })

    await commandBus.dispatch(command)

    assert.deepEqual(receivedCommand, command)
  })

  test('should use custom command publisher if provided', async ({ assert }) => {
    class TestPublisher implements BaseCommandPublisher {
      public command: any

      async publish(command: any) {
        this.command = command
      }
    }

    const publisher = new TestPublisher()

    const { app } = await setupApp({
      config: {
        cqrs: defineConfig({
          [UNSAFE]: true,
          publishers: {
            commands: publisher,
          },
        }),
      },
    })

    const commandBus = await app.container.make(CommandBus)

    const TestCommand = await import(
      // @ts-ignore
      './tmp/app/commands/tests/create_test_command.ts'
    )

    const command = new TestCommand.default()

    await commandBus.dispatch(command)

    assert.deepEqual(publisher.command, command)
  })

  test('should publish query to subject', async ({ assert }) => {
    const { app } = await setupApp()
    const queryBus = await app.container.make(QueryBus)

    const TestQuery = await import(
      // @ts-ignore
      './tmp/app/queries/tests/get_test_query.ts'
    )

    const query = new TestQuery.default()
    let receivedQuery: any

    queryBus.subject$.subscribe((cmd) => {
      receivedQuery = cmd
    })

    await queryBus.execute(query)

    assert.deepEqual(receivedQuery, query)
  })

  test('should use custom query publisher if provided', async ({ assert }) => {
    class TestPublisher implements BaseQueryPublisher {
      public query: any

      async publish(query: any) {
        this.query = query
      }
    }

    const publisher = new TestPublisher()

    const { app } = await setupApp({
      config: {
        cqrs: defineConfig({
          [UNSAFE]: true,
          publishers: {
            queries: publisher,
          },
        }),
      },
    })

    const queryBus = await app.container.make(QueryBus)

    const TestQuery = await import(
      // @ts-ignore
      './tmp/app/queries/tests/get_test_query.ts'
    )

    const query = new TestQuery.default()

    await queryBus.execute(query)

    assert.deepEqual(publisher.query, query)
  })
})
