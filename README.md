# adonisjs-cqrs

[![npm version](https://badge.fury.io/js/adonisjs-cqrs.svg)](https://www.npmjs.com/package/adonisjs-cqrs)
[![npm downloads](https://img.shields.io/npm/dm/adonisjs-cqrs.svg)](https://www.npmjs.com/package/adonisjs-cqrs)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A robust and scalable CQRS (Command and Query Responsibility Segregation) package for AdonisJS v6.

This package simplifies the implementation of CQRS in your AdonisJS applications by providing automatic handler discovery, lazy loading, and seamless dependency injection for commands and queries.

## 🚀 Features

- **Automatic Handler Discovery**: No manual registration needed.
- **Lazy Loading**: Handlers loaded only when dispatched.
- **Dependency Injection**: Full support for AdonisJS IoC container.
- **Pub/Sub System**: Observe command execution with RxJS.

## 📦 Installation

The recommended way to install and configure `adonisjs-cqrs` is via the AdonisJS Ace command:

```bash
node ace add adonisjs-cqrs
```

Alternatively, you can install it manually:

```bash
npm i adonisjs-cqrs
node ace configure adonisjs-cqrs
```

## 💡 Usage

### Commands

#### 1. Define a Command

Commands are simple objects representing an action. The generic type `ICreateUserResult` defines the expected return type from the command's handler.

```typescript
// app/commands/create_user/create_user_command.ts
import { Command } from 'adonisjs-cqrs/core'

// Define the expected result type when this command is handled
export type ICreateUserResult = { success: boolean; userId: string }

interface CreateUserPayload {
  name: string
  email: string
}

export default class CreateUserCommand extends Command<ICreateUserResult> {
  public payload: CreateUserPayload

  constructor(payload: CreateUserPayload) {
    super()
    this.payload = payload
  }
}
```

#### 2. Define a Command Handler

Command handlers contain the business logic to execute a specific command. They are automatically discovered and their dependencies are injected.

```typescript
// app/commands/create_user/create_user_handler.ts
import { inject } from '@adonisjs/core/container'
import { CommandHandler } from 'adonisjs-cqrs/decorators'
import CreateUserCommand, { ICreateUserResult } from './create_user_command.js'
import { LoggerService } from '#app/services/logger_service' // Example service

@inject()
@CommandHandler(CreateUserCommand)
export default class CreateUserHandler {
  constructor(protected logger: LoggerService) {}

  async handle(command: CreateUserCommand): Promise<ICreateUserResult> {
    this.logger.info('Creating user:', command.payload)
    // Implement user creation logic here
    return { success: true, userId: 'some-uuid' }
  }
}
```

#### 3. Dispatch a Command

You can dispatch commands using the `CommandBus` instance, which can be resolved from the IoC container.

```typescript
// app/controllers/users_controller.ts
import { inject } from '@adonisjs/core/container'
import { HttpContext } from '@adonisjs/core/http'
import { CommandBus } from 'adonisjs-cqrs/buses'
import CreateUserCommand from '#app/commands/create_user/create_user_command'

@inject()
export default class UsersController {
  constructor(protected commandBus: CommandBus) {}

  async store({ request, response }: HttpContext) {
    const payload = request.only(['name', 'email'])
    const command = new CreateUserCommand(payload)

    const result = await this.commandBus.dispatch(command)

    return response.created(result)
  }
}
```

### Queries

#### 1. Define a Query

Queries are simple objects representing a request for data. The generic type `IGetUserResult` defines the expected return type from the query's handler.

```typescript
// app/queries/get_user/get_user_query.ts
import { Query } from 'adonisjs-cqrs/core'

// Define the expected result type when this query is handled
export type IGetUserResult = { id: string; name: string; email: string }

interface GetUserPayload {
  userId: string
}

export default class GetUserQuery extends Query<IGetUserResult> {
  public payload: GetUserPayload

  constructor(payload: GetUserPayload) {
    super()
    this.payload = payload
  }
}
```

#### 2. Define a Query Handler

Query handlers contain the logic to retrieve data. They are automatically discovered and their dependencies are injected.

```typescript
// app/queries/get_user/get_user_handler.ts
import { inject } from '@adonisjs/core/container'
import { QueryHandler } from 'adonisjs-cqrs/decorators'
import GetUserQuery, { IGetUserResult } from './get_user_query.js'
import { UserRepository } from '#app/services/user_repository' // Example service

@inject()
@QueryHandler(GetUserQuery)
export default class GetUserHandler {
  constructor(protected userRepository: UserRepository) {}

  async handle(query: GetUserQuery): Promise<IGetUserResult> {
    this.logger.info('Fetching user:', query.payload.userId)
    // Implement user fetching logic here
    const user = await this.userRepository.findById(query.payload.userId)
    return { id: user.id, name: user.name, email: user.email }
  }
}
```

#### 3. Execute a Query

You can execute queries using the `QueryBus` instance, which can be resolved from the IoC container.

```typescript
// app/controllers/users_controller.ts
import { inject } from '@adonisjs/core/container'
import { HttpContext } from '@adonisjs/core/http'
import { QueryBus } from 'adonisjs-cqrs/buses'
import GetUserQuery from '#app/queries/get_user/get_user_query'

@inject()
export default class UsersController {
  constructor(protected queryBus: QueryBus) {}

  async show({ params, response }: HttpContext) {
    const query = new GetUserQuery({ userId: params.id })

    const result = await this.queryBus.execute(query)

    return response.ok(result)
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) (coming soon) for more details.

## 📄 License

MIT License © [IzzyJs](https://github.com/IzzyJs)

<div align="center">
  <sub>Built with ❤︎ by <a href="https://github.com/lncitador">Walaff Fernandes</a>
</div>
