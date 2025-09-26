# CQRS Provider

Este diretório contém o ServiceProvider principal para o sistema CQRS (Command Query Responsibility Segregation) do AdonisJS v6.

## Arquivos

- `cqrs_provider.ts` - ServiceProvider principal que registra o CommandBus e executa a descoberta automática de handlers

## Como usar

1. **Registrar o provider** no arquivo `start/kernel.ts`:

```typescript
import providers from './providers.js'

export default {
  providers: [
    // ... outros providers
    () => import('../providers/cqrs_provider.js')
  ]
}
```

2. **Configurar o CQRS** no arquivo `config/cqrs.ts`:

```typescript
import { CQRSConfig } from '../src/types/config.js'

const cqrsConfig: CQRSConfig = {
  root: 'app', // Diretório raiz da aplicação
  directories: {
    // Múltiplos diretórios para organização modular
    commands: [
      'users/commands',      // app/users/commands/**/*_handler.ts
      'todo/commands',       // app/todo/commands/**/*_handler.ts
      'orders/commands',     // app/orders/commands/**/*_handler.ts
      'commands/handlers'    // app/commands/handlers/**/*_handler.ts
    ]
  }
}

export default cqrsConfig
```

3. **Criar comandos e handlers** seguindo a convenção modular:

```typescript
// app/users/commands/create_user/create_user_command.ts
export class CreateUserCommand extends Command<{ id: string }> {
  constructor(public readonly data: { name: string; email: string }) {
    super()
  }
}

// app/users/commands/create_user/create_user_handler.ts
@CommandHandler(CreateUserCommand)
@inject()
export default class CreateUserHandler implements BaseCommandHandler<CreateUserCommand> {
  constructor(private loggerService: LoggerService) {}

  async execute(command: CreateUserCommand) {
    // Lógica do handler
    return { id: 'user_123' }
  }
}
```

4. **Usar o CommandBus**:

```typescript
import { CommandBus } from '../src/buses/command.js'

// Em um controller ou service
const commandBus = await app.container.make(CommandBus)

// Executar comando
const result = await commandBus.dispatch(new CreateUserCommand({ 
  name: 'John', 
  email: 'john@example.com',
  role: 'admin'
}))

// Obter informações do comando
const commandInfo = commandBus.getCommandInfo(command)
console.log(`Comando: ${commandInfo.name}, ID: ${commandInfo.id}`)

// Obter informações do handler para um comando específico
const handlerInfo = commandBus.getHandlerInfo(command)
if (handlerInfo) {
  console.log(`Handler: ${handlerInfo.handlerName} (${handlerInfo.commandName})`)
}

// Listar handlers registrados (usando commandId como chave, mas incluindo commandName para logs)
const handlers = commandBus.getRegisteredHandlers()
console.log('Handlers registrados:', handlers)
// Output: [{ commandId: "uuid", commandName: "CreateUserCommand", handlerName: "CreateUserHandler", filePath: "..." }]
```

## Funcionalidades

- ✅ Descoberta automática de handlers
- ✅ Lazy loading de handlers
- ✅ Injeção de dependência via `@inject()`
- ✅ Sistema de observabilidade com RxJS
- ✅ Suporte a testes com `container.swap()`
- ✅ Organização modular por domínio e funcionalidade
- ✅ Configuração flexível de múltiplos diretórios
- ✅ Métodos utilitários para informações de comandos
- ✅ Tratamento de erros com exceções específicas

## Estrutura Recomendada

```
app/
├── users/
│   └── commands/
│       ├── create_user/
│       │   ├── create_user_command.ts
│       │   └── create_user_handler.ts
│       ├── update_user/
│       │   ├── update_user_command.ts
│       │   └── update_user_handler.ts
│       └── delete_user/
│           ├── delete_user_command.ts
│           └── delete_user_handler.ts
├── todo/
│   └── commands/
│       ├── create_todo/
│       │   ├── create_todo_command.ts
│       │   └── create_todo_handler.ts
│       └── complete_todo/
│           ├── complete_todo_command.ts
│           └── complete_todo_handler.ts
└── orders/
    └── commands/
        ├── create_order/
        │   ├── create_order_command.ts
        │   └── create_order_handler.ts
        └── cancel_order/
            ├── cancel_order_command.ts
            └── cancel_order_handler.ts
```
