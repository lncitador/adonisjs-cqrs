import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'
import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

export async function configure(command: ConfigureCommand) {
  const codemods = await command.createCodemods()

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(stubsRoot, 'config.stub', {})

  /**
   * Register provider
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('adonisjs-cqrs/providers/cqrs_provider')
  })

  /**
   * Add commands to ace and set directories
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addCommand('adonisjs-cqrs/commands')
    rcFile.setDirectory("'cqrs.commands'", 'app/commands')
    rcFile.setDirectory("'cqrs.queries'", 'app/queries')
    rcFile.setDirectory("'cqrs.handlers'", 'app/handlers')
  })

  /**
   * Install dependencies
   */
  await codemods.installPackages([{ name: 'rxjs', isDevDependency: true }])

  /**
   * Read and update imports in package.json
   */
  const packageJson = JSON.parse(
    readFileSync(path.join(fileURLToPath(command.app.appRoot), 'package.json'), 'utf-8')
  )

  packageJson.imports['#commands/*'] = './app/commands/*.js'
  packageJson.imports['#queries/*'] = './app/queries/*.js'
  packageJson.imports['#handlers/*'] = './app/handlers/*.js'

  writeFileSync(
    path.join(fileURLToPath(command.app.appRoot), 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf-8'
  )
}
