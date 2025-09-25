### **Proof of Concept (POC) Document: CQRS Package for AdonisJS v6**

#### **1. Introduction and Objective**

This Proof of Concept (POC) has as its main objective to validate the technical feasibility of the core architecture of a CQRS package for AdonisJS v6. The focus is to demonstrate that the **automatic handler discovery mechanism**, combined with **lazy loading** and **dependency injection**, can be implemented efficiently and elegantly, using native tools from the AdonisJS ecosystem, namely `@adonisjs/fold`.

The success of this POC will prove that it is possible to build a system where the user only needs to create handler classes following a convention, without the need for any manual registration, while maintaining application performance and code simplicity.

#### **2. POC Scope**

##### **Included Features:**

- Implementation of a functional `CommandBus`.
- Creation of a `ServiceProvider` that initiates the discovery process.
- A discovery mechanism that analyzes a predefined directory searching for handler files.
- Registration of found handlers in a way that allows lazy loading.
- Execution of a command, with instantiation of its handler and dependency injection via `@inject()`.

##### **Excluded Features:**

- Implementation of `QueryBus` (its logic will be analogous to `CommandBus`).
- Creation of `ace` commands for boilerplate generation.
- A complete configuration file (`config/cqrs.ts`); a predefined path will be used for the POC.
- Error handling and complex validations.
- End-user documentation.

#### **3. POC Requirements**

##### **3.1. Functional Requirements (FR)**

- **FR-01: Handler Discovery:** The system must be able to analyze a specific directory (e.g., `app/commands/handlers`) and identify all files that follow a naming convention (e.g., ending in `_handler.ts`).
- **FR-02: CommandBus Registration:** A `CommandBus` service must be registered in the IoC container as a singleton, ensuring that the same instance is shared throughout the application.
- **FR-03: Command Dispatch:** The `CommandBus` must expose a `dispatch(command)` method that accepts an instance of a command object.
- **FR-04: Execution with Dependency Injection:** When dispatching a command, the system must find the corresponding handler, instantiate it using `container.make()` to resolve its dependencies (marked with `@inject()`), and invoke its `handle` method.
- **FR-05: Lazy Loading Support:** The system must use a lazy loading approach, such as `module expressions`, to avoid importing all handlers during application startup.

##### **3.2. Non-Functional Requirements (NFR)**

- **NFR-01: Startup Performance:** The discovery mechanism must not significantly impact the application's boot time. Handler code loading should only occur at the exact moment of its first use.
- **NFR-02: Low Coupling:** Handlers must not have direct knowledge of the container or the bus. Dependency injection should be the only interaction with the system.
- **NFR-03: Testability:** The architecture must allow a handler or its dependencies to be easily replaced during tests, using features like `container.swap()`.

#### **4. Business Rules (System Rules)**

- **BR-01: Naming Convention:** To be discovered, a handler file must follow a naming pattern, for example, `[CommandName]Handler.ts`.
- **BR-02: Default Export:** Each handler file must contain a single class exported as `export default`, a necessary premise for the functioning of `module expressions`.
- **BR-03: Constructor Dependencies:** All handler dependencies must be declared as constructor parameters and the class must be marked with the `@inject()` decorator so that `@adonisjs/fold` can resolve them.
- **BR-04: Command-Handler Association:** There will be a one-to-one association between a Command and its Handler, derived from the naming convention.

#### **5. Execution Plan and Tasks (Step by Step)**

##### **Phase 1: Environment Setup**

- **Task 1.1:** Create a new AdonisJS v6 project.
- **Task 1.2:** Install necessary dependencies: `picomatch`.
- **Task 1.3:** Configure `tsconfig.json` to support decorators (`emitDecoratorMetadata: true`) and install `reflect-metadata`.

##### **Phase 2: Core System Implementation**

- **Task 2.1: Create the `CommandBus`:**
  - Develop the `CommandBus` class with an internal map to register handlers and a `dispatch` method.
  - The `dispatch` logic will use a module importer (such as `moduleImporter` or `moduleExpression`) to dynamically load the handler class before instantiating it with `container.make()`.
- **Task 2.2: Create the `ServiceProvider`:**
  - Create a `CqrsProvider.ts`.
  - In the `register` method, register the `CommandBus` as a singleton using `this.app.container.singleton(CommandBus, ...)`.
- **Task 2.3: Create an Example Handler:**
  - Create a fictional service (e.g., `app/services/logger_service.ts`).
  - Create a command (`app/commands/create_user_command.ts`).
  - Create the corresponding handler (`app/commands/handlers/create_user_handler.ts`) that receives the `LoggerService` in its constructor, marked with `@inject()`.

##### **Phase 3: Automatic Discovery Implementation**

- **Task 3.1: Create the Discovery Module:**
  - Develop a function that uses `glob` and `picomatch` to scan the `app/commands/handlers/` directory and find all files ending in `_handler.ts`.
- **Task 3.2: Implement Registration Logic in `ServiceProvider`:**
  - In the `ServiceProvider`'s `boot` method, call the discovery function.
  - For each file found, extract the command name by convention and register in the `CommandBus` the association between the command name and the reference to its module (using a `module expression` or a `module importer`).

##### **Phase 4: Validation with Automated Tests (Japa)**

- **Task 4.1: Configure Test Environment:**
  - Create a new integration test file, for example: `tests/integration/cqrs.spec.ts`.
- **Task 4.2: Write Validation Test:**
  - Inside a Japa test (`test(...)`), get access to the IoC container (available through the `app` object in AdonisJS tests).
  - **Use `container.swap()` to replace the real implementation of `LoggerService` with a fake version or a mock**. This is the main advantage of using the container for tests, as it allows isolating the component being tested.
  - Get the `CommandBus` instance from the container: `await app.container.make(CommandBus)`.
  - Dispatch the `CreateUserCommand` using the bus.
  - Make assertions (`assert`) to verify if the fake `LoggerService` version's method was called, proving that the entire chain (discovery -> dispatch -> dependency injection -> execution) worked correctly.
- **Task 4.3: Run Tests:**
  - Execute the test suite through the `node ace test` command.
  - A successful test will validate the end-to-end functionality of the POC.

#### **6. POC Success Criteria**

The POC will be considered successful if the following conditions are satisfied:

1. The `CommandBus` can dispatch a command to the correct handler without manual registration, **validated by a passing Japa test**.
2. The handler is loaded only at the moment of dispatch, which is implicitly validated by the test startup performance.
3. The handler's dependencies, marked with `@inject()`, are correctly resolved and injected by the container.
4. The architecture demonstrates to be **highly testable**, allowing the replacement of implementations with `container.swap()`, as demonstrated in the integration test.
