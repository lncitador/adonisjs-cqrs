import string from '@adonisjs/core/helpers/string'

type Entity = {
  name: string
  path: string
}

interface Generators {
  queryName(entityName: string): string
  queryFileName(entityName: string): string
  queryImport(entity: Entity): string
  commandName(entityName: string): string
  commandFileName(entityName: string): string
  commandImport(entity: Entity): string
  handlerName(entityName: string): string
  handlerFileName(entityName: string): string
  handlerImport(entity: Entity): string
}

export const generators: Generators = {
  queryName(entityName: string): string {
    return string
      .create(entityName)
      .removeExtension()
      .removeSuffix('model')
      .removeSuffix('query')
      .singular()
      .pascalCase()
      .suffix('Query')
      .toString()
  },

  queryFileName(entityName: string): string {
    return string.create(this.queryName(entityName)).snakeCase().ext('.ts').toString()
  },

  queryImport(entity: Entity): string {
    const parts = entity.path === './' ? 1 : entity.path.split('/').length + 1
    const relativePath = Array(parts).fill('..').join('/')
    const fileNameJs = string
      .create(this.queryFileName(entity.name))
      .removeExtension()
      .ext('.js')
      .toString()
    return [relativePath, 'queries', entity.path, fileNameJs].filter((it) => it !== './').join('/')
  },

  commandName(entityName: string): string {
    return string
      .create(entityName)
      .removeExtension()
      .removeSuffix('model')
      .removeSuffix('command')
      .singular()
      .pascalCase()
      .suffix('Command')
      .toString()
  },

  commandFileName(entityName: string): string {
    return string.create(this.commandName(entityName)).snakeCase().ext('.ts').toString()
  },

  commandImport(entity: Entity): string {
    const parts = entity.path === './' ? 1 : entity.path.split('/').length + 1
    const relativePath = Array(parts).fill('..').join('/')
    const fileNameJs = string
      .create(this.commandFileName(entity.name))
      .removeExtension()
      .ext('.js')
      .toString()
    return [relativePath, 'commands', entity.path, fileNameJs].filter((it) => it !== './').join('/')
  },

  handlerName(entityName: string): string {
    return string
      .create(entityName)
      .removeExtension()
      .removeSuffix('model')
      .removeSuffix('handler')
      .singular()
      .pascalCase()
      .suffix('Handler')
      .toString()
  },

  handlerFileName(entityName: string): string {
    return string.create(this.handlerName(entityName)).snakeCase().suffix('.ts').toString()
  },

  handlerImport(entity: Entity): string {
    const parts = entity.path === './' ? 1 : entity.path.split('/').length + 1
    const relativePath = Array(parts).fill('..').join('/')
    const fileNameJs = string
      .create(this.handlerFileName(entity.name))
      .removeExtension()
      .ext('.js')
      .toString()
    return [relativePath, 'handlers', entity.path, fileNameJs].filter((it) => it !== './').join('/')
  },
}
