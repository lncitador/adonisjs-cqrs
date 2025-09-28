import { test } from '@japa/runner'
import { setupApp } from './helpers.js'
import { CommandBus } from '../src/buses/command.js'
import MakeCommand from '../commands/make_command.js'
import { defineConfig } from '../src/define_config.js'
import { BaseCommandPublisher } from '../src/types/command.js'

test.group('PubSub', (group) => {
  group.each.setup(async () => {
    const { ace } = await setupApp()
    const command = await ace.create(MakeCommand, ['test'])
    await command.exec()
  })

  test('should publish command to subject', async ({ assert }) => {
    const { app } = await setupApp()
    const commandBus = await app.container.make(CommandBus)

    const TestCommand = await import(
      // @ts-ignore
      './tmp/app/commands/test/test_command.js'
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
          publishers: {
            commands: publisher,
          },
        }),
      },
    })

    const commandBus = await app.container.make(CommandBus)

    const TestCommand = await import(
      // @ts-ignore
      './tmp/app/commands/test/test_command.js'
    )

    const command = new TestCommand.default()

    await commandBus.dispatch(command)

    assert.deepEqual(publisher.command, command)
  })
})
