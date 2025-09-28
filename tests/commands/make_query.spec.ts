import { test } from '@japa/runner'
import { setupApp } from '../helpers.js'
import MakeQuery from '../../commands/make_query.js'

test.group('MakeQuery', () => {
  test('create query and handler files', async ({ assert }) => {
    const { ace, prepareStub } = await setupApp()

    const command = await ace.create(MakeQuery, ['get_user'])
    await command.exec()

    const name = 'get_user'
    const destinationDir = `app/queries/${name}`

    const queryPath = `${destinationDir}/get_user_query.ts`
    const handlerPath = `${destinationDir}/get_user_handler.ts`

    const { contents: queryContents } = await prepareStub('make/query.stub', {
      name,
      destinationDir,
    })

    const { contents: handlerContents } = await prepareStub('make/query_handler.stub', {
      name,
      destinationDir,
    })

    await assert.fileExists(queryPath)
    await assert.fileExists(handlerPath)
    await assert.fileEquals(queryPath, queryContents)
    await assert.fileEquals(handlerPath, handlerContents)
  })

  test('create query and handler in a custom directory', async ({ assert }) => {
    const { ace, prepareStub } = await setupApp()

    const command = await ace.create(MakeQuery, ['get_order', '-d', 'orders'])
    await command.exec()

    const name = 'get_order'
    const destinationDir = `app/orders/queries/${name}`

    const queryPath = `${destinationDir}/get_order_query.ts`
    const handlerPath = `${destinationDir}/get_order_handler.ts`

    const { contents: queryContents } = await prepareStub('make/query.stub', {
      name,
      destinationDir,
    })

    const { contents: handlerContents } = await prepareStub('make/query_handler.stub', {
      name,
      destinationDir,
    })

    await assert.fileExists(queryPath)
    await assert.fileExists(handlerPath)
    await assert.fileEquals(queryPath, queryContents)
    await assert.fileEquals(handlerPath, handlerContents)
  })

  test('skip when query and handler already exist', async ({ assert, fs }) => {
    const { ace } = await setupApp()
    ace.ui.switchMode('raw')

    const name = 'existing_file'
    const destinationDir = `app/queries/${name}`

    const queryPath = `${destinationDir}/existing_file_query.ts`
    const handlerPath = `${destinationDir}/existing_file_handler.ts`

    await fs.create(queryPath, `// Existing query file`)
    await fs.create(handlerPath, `// Existing handler file`)

    const command = await ace.create(MakeQuery, [name])
    await command.exec()

    await assert.fileEquals(queryPath, `// Existing query file`)
    await assert.fileEquals(handlerPath, `// Existing handler file`)

    assert.deepEqual(ace.ui.logger.getLogs(), [
      {
        message: `cyan(SKIPPED:) create ${queryPath.replace(/\\/g, '/')} dim((File already exists))`,
        stream: 'stdout',
      },
      {
        message: `cyan(SKIPPED:) create ${handlerPath.replace(/\\/g, '/')} dim((File already exists))`,
        stream: 'stdout',
      },
    ])
  })
})
