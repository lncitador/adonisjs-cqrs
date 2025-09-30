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

### Configuration

After installation, the package will add a new `directories` entry to your `.adonisrc.json` file. These paths are used by the `make` commands to generate files in the correct location.

```json
// .adonisrc.json
{
  // ...
  "directories": {
    "cqrs.commands": "app/commands",
    "cqrs.queries": "app/queries",
    "cqrs.handlers": "app/handlers"
  }
}
```

### Available Commands

This package provides a set of `ace` commands to speed up your development workflow.

#### `make:cqrs:command`

Creates a new command and its corresponding handler.

```bash
# Create a new command and handler
node ace make:cqrs:command User/CreateUser

# Create only the command file
node ace make:cqrs:command User/CreateUser --command-only
```

#### `make:cqrs:query`

Creates a new query and its corresponding handler.

```bash
# Create a new query and handler
node ace make:cqrs:query User/GetUser

# Create only the query file
node ace make:cqrs:query User/GetUser --query-only
```

#### `make:cqrs:handler`

Creates a new handler for an existing command or query.

```bash
# Create a handler for a command
node ace make:cqrs:handler User/CreateUser --command

# Create a handler for a query
node ace make:cqrs:handler User/GetUser --query

# Or run it interactively
node ace make:cqrs:handler User/CreateUser
```

#### `list:handlers`

Lists all registered command and query handlers in your application. This is useful for debugging.

```bash
# Display handlers in a table
node ace list:handlers

# Output as JSON
node ace list:handlers --json
```

### Usage Example

1.  **Generate a Query and its Handler**:

    ```bash
    node ace make:cqrs:query User/GetUser
    ```

    This will create `app/queries/user/get_user_query.ts` and `app/handlers/user/get_user_handler.ts`.

2.  **Implement the Handler**:

    Fill in the business logic inside the generated handler file.

    ```typescript
    // app/handlers/user/get_user_handler.ts
    import { QueryHandler } from 'adonisjs-cqrs/decorators'
    import GetUserQuery from '#queries/user/get_user_query'
    // ...

    @QueryHandler(GetUserQuery)
    export default class GetUserHandler {
      public async handle(query: GetUserQuery) {
        // Your logic to fetch a user
        console.log('Fetching user:', query.userId)
        return { id: query.userId, name: 'John Doe' }
      }
    }
    ```

3.  **Execute the Query**:

    Use the `QueryBus` to execute the query from anywhere in your app, like a controller.

    ```typescript
    // app/controllers/users_controller.ts
    import { inject } from '@adonisjs/core'
    import { QueryBus } from 'adonisjs-cqrs/buses'
    import GetUserQuery from '#queries/user/get_user_query'

    @inject()
    export default class UsersController {
      constructor(protected queryBus: QueryBus) {}

      async show({ params }: HttpContext) {
        const query = new GetUserQuery(params.id)
        const user = await this.queryBus.execute(query)
        return user
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
