<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">MLocks Task Manager API</h1>

The task manager API will have the following features:

- **User Service**: handles user registration, login, and profile management
- **Task Service**: manages tasks, including creation, assignment, and status updates
- **Notification Service**: sends notifications to users when tasks are assigned or updated

![MLocks Task Manager](static/logo-mlocks-task-manager.png)

## Technologies Used

- **NestJS**: a progressive Node.js framework for building efficient and scalable server-side applications

- **Postgres**: a powerful, open-source relational database
- **RabbitMQ**: a message broker for handling communication between services
- **Docker**: for containerization and deployment

## Security Features

- **JWT Authentication**: secure user authentication using JSON Web Tokens
- **Role-Based Access Control**: restrict access to certain features based on user roles
- **Input Validation**: validate user input to prevent SQL injection and cross-site scripting (XSS)
- **Encryption**: encrypt sensitive data, such as passwords and notification tokens

## Deployment Specifications

- **Docker Compose**: for orchestrating containers and managing dependencies
- **Kubernetes**: for scaling and managing containers in production
- **Environment Variables**: for storing sensitive data, such as database credentials and API keys

A High-Level Architecture Digram:

```
                               ┌───────────────────────────┐
                               │      Task Manager         │
                               └────────────┬──────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        │                                   │                                   │

┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│     User Service     │        │     Task Service     │        │ Notification Service │
│  (NestJS App)        │        │  (NestJS App)        │        │  (NestJS App)        │
│                      │        │                      │        │                      │
│ - Auth Module        │        │ - Task CRUD          │        │ - Event Handlers     │
│ - User Module        │        │ - Emits Events       │        │ - Mail Integration   │
│ - JWT                │        │                      │        │ - User Projection    │
└──────────┬───────────┘        └──────────┬───────────┘        └──────────┬───────────┘
           │                                 │                                 │
           │                                 │                                 │
           ▼                                 ▼                                 ▼
     PostgreSQL                        PostgreSQL                         PostgreSQL
         (logical ownership per service / schema)

                         ┌──────────────────────────┐
                         │        RabbitMQ          │
                         │  Event Communication     │
                         └──────────────────────────┘
                                   ▲
                                   │ task.assigned
                                   │ user.created
                                   ▼

                         ┌──────────────────────────┐
                         │         Mailhog          │
                         │       SMTP (Dev)         │
                         └──────────────────────────┘


Internal Tool:

┌──────────────────────────────┐
│      Docs Aggregator         │
│ - Merges OpenAPI specs       │
│ - Produces combined.json     │
└──────────────────────────────┘
```

#### apps/

Each service is an independent NestJS application:

- `apps/user-service`
- `apps/task-service`
- `apps/notification-service`

Each has:

- its own `main.ts`
- its own `AppModule`
- its own environment configuration
- its own Docker runtime

They communicate asynchronously via RabbitMQ.

#### libs/

Shared reusable modules:

- `libs/auth`
- `libs/common`
- `libs/database`
- `libs/mail`

These are:

- Pure TypeScript libraries
- Compiled once
- Used by all apps
- No business ownership

Important: libs do NOT represent services. They are internal shared code.

#### Infrastructure Layer

External services (Docker containers):

- PostgreSQL (data persistence)
- RabbitMQ (event-driven communication)

These are not inside the monorepo. They are infrastructure.

#### Communication Flow

An example flow:

1. Task Service creates a task
2. Task Service persists to Postgres
3. Emits event to RabbitMQ
4. Notification Service consumes event
5. Sends email via Mailhog (in dev)

#### The directory structure of the project:

```
.
├── apps
│   ├── docs-aggregator
│   │   ├── docs
│   │   │   ├── combined.json
│   │   │   ├── notification-service.json
│   │   │   ├── task-service.json
│   │   │   └── user-service.json
│   │   ├── main.ts
│   │   └── merge-openapi.ts
│   ├── notification-service
│   │   ├── app.module.ts
│   │   ├── Dockerfile
│   │   ├── main.ts
│   │   └── notification
│   │       ├── notification.controller.spec.ts
│   │       ├── notification.controller.ts
│   │       ├── notification.entity.ts
│   │       ├── notification.module.ts
│   │       ├── notification.service.spec.ts
│   │       ├── notification.service.ts
│   │       └── user-projection.entity.ts
│   ├── task-service
│   │   ├── app.module.ts
│   │   ├── constants.ts
│   │   ├── Dockerfile
│   │   ├── main.ts
│   │   └── task
│   │       ├── dto
│   │       │   ├── create-task.dto.ts
│   │       │   └── update-task.dto.ts
│   │       ├── task.controller.spec.ts
│   │       ├── task.controller.ts
│   │       ├── task.entity.ts
│   │       ├── task.module.ts
│   │       ├── task.service.spec.ts
│   │       └── task.service.ts
│   └── user-service
│       ├── app.module.ts
│       ├── auth
│       │   ├── admin.guard.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   ├── auth.service.ts
│       │   └── auth.utils.ts
│       ├── Dockerfile
│       ├── main.ts
│       └── user
│           ├── dto
│           │   ├── create-user.dto.ts
│           │   ├── role-response.dto.ts
│           │   ├── update-user.dto.ts
│           │   └── user-response.dto.ts
│           ├── role.entity.ts
│           ├── user.controller.spec.ts
│           ├── user.controller.ts
│           ├── user.entity.ts
│           ├── user.module.ts
│           ├── user.service.spec.ts
│           └── user.service.ts
├── docker-compose.yml
├── Dockerfile
├── .env-example
├── .eslintrc.js
├── .gitignore
├── libs
│   ├── auth
│   │   ├── auth.module.ts
│   │   ├── constants.ts
│   │   ├── decorator
│   │   │   └── current-user.decorator.ts
│   │   ├── dto
│   │   │   └── login.dto.ts
│   │   ├── index.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt.strategy.ts
│   │   └── owner.guard.ts
│   ├── common
│   ├── database
│   │   ├── database.interface.ts
│   │   ├── database.module.ts
│   │   ├── database.providers.ts
│   │   ├── database.service.spec.ts
│   │   ├── database.service.ts
│   │   ├── index.ts
│   │   └── README.md
│   └── mail
│       ├── index.ts
│       ├── mail.module.ts
│       ├── mail.service.spec.ts
│       └── mail.service.ts
├── LICENSE
├── migrations
├── nest-cli.json
├── package.json
├── package-lock.json
├── .prettierrc
├── README.md
├── schema.sql
├── static
│   ├── logo-mlocks-task-manager.png
│   └── schema_ER_diagram.png
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
└── tsconfig.json

22 directories, 84 files
```

## Database Schema ([schema.sql](./schema.sql))

Explanation of main Tables and Columns:

_**roles**_ Table:

- **id**: SERIAL (auto-incrementing integer) - Primary Key
- **type**: roles_type_enum (custom enum) - Must be unique and cannot be null.
- **description**: VARCHAR(100)
- **created_at**: TIMESTAMP WITH TIME ZONE - Defaults to the current timestamp.
- **updated_at**: TIMESTAMP WITH TIME ZONE - Defaults to the current timestamp.

```sql
-- Create Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    type roles_type_enum NOT NULL UNIQUE,
    description VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default roles
INSERT INTO roles (type, description) VALUES
    ('admin', 'Administrator with full access'),
    ('manager', 'Manager with elevated privileges'),
    ('user', 'Regular user with limited permissions');

```

_**users**_ Table:

- **id**: Primary key, auto-incrementing integer.
- **username**: Unique identifier for login, string.
- **email**: User's email, unique.
- **password_hash**: Stores the securely hashed password. Never store plain text passwords!
- **first_name, last_name**: Optional fields for user's real name.
- **created_at, updated_at**: Timestamps for tracking record creation and last update.

```sql
-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role_id INTEGER DEFAULT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, never plain text!
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE, -- For soft deletes
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT -- Prevent deletion of roles that are assigned to users
);
```

_**tasks**_ Table:

- **id**: Primary key, auto-incrementing.
- **title**: Short title for the task.
- **description**: Detailed description of the task.
status: Current state of the task (e.g., 'pending', 'in_progress', 'completed').
- **priority**: Urgency level of the task (e.g., 'low', 'medium', 'high').
- **due_date**: When the task should be completed.
- **assigned_to_user_id**: Foreign key referencing the users table, indicating who the task is assigned to. Can be NULL if unassigned.
- **created_by_user_id**: Foreign key referencing the users table, indicating who created the task.
- **created_at, updated_at**: Timestamps.

```sql
-- Create Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'in_progress', 'completed', 'canceled'
    priority VARCHAR(50) NOT NULL DEFAULT 'medium', -- e.g., 'low', 'medium', 'high', 'urgent'
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to_user_id INTEGER,
    created_by_user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assigned_to
        FOREIGN KEY (assigned_to_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL, -- If a user is deleted, their assigned tasks become unassigned
    CONSTRAINT fk_created_by
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE -- If a user is deleted, their created tasks are also deleted
);
```

_**notifications**_ Table:

- **id**: Primary key, auto-incrementing.
- **user_id**: Foreign key referencing the users table, indicating who receives the notification.
- **task_id**: Optional foreign key to associate the notification with a specific task.
- **message**: The content of the notification.
- **type**: Categorizes the notification (e.g., 'task_assigned', 'system_message').
- **is_read**: Boolean flag to track if the user has seen the notification.
- **created_at**: Timestamp.

```sql
-- Create Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    task_id INTEGER, -- Optional, if notification is task-related
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'task_assigned', 'task_updated', 'system'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE, -- If a user is deleted, their notifications are also deleted
    CONSTRAINT fk_notification_task
        FOREIGN KEY (task_id)
        REFERENCES tasks(id)
        ON DELETE SET NULL -- If a task is deleted, notification task_id becomes NULL
);
```

_**user_projection**_ Table:

- **id**: INTEGER - Primary Key. Not auto-incrementing.
- **email**: VARCHAR
- **username**: VARCHAR
- **updatedAt**: TIMESTAMP - Defaults to the current time and cannot be null.

```sql
-- Create Users Preojection Table
CREATE TABLE user_projection (
    id int4 NOT NULL,
    email varchar NULL,
    username varchar NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT pk_user_projection PRIMARY KEY (id)
);
```

Add indexes for performance on foreign keys and frequently queried columns

```sql
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_priority ON tasks (priority);
CREATE INDEX idx_tasks_assigned_to_user_id ON tasks (assigned_to_user_id);
CREATE INDEX idx_tasks_created_by_user_id ON tasks (created_by_user_id);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);
```

### Key features of the Schema:

- **Primary Keys (`SERIAL PRIMARY KEY`)**: Ensures each record has a unique identifier and automatically increments.

- **Foreign Keys (`FOREIGN KEY ... REFERENCES ...`)**: Establishes relationships between tables (tasks to users, notifications to users and tasks).

- **`ON DELETE SET NULL`**: For assigned_to_user_id and notification.task_id, if the referenced user/task is deleted, the foreign key column is set to NULL.

- **`ON DELETE CASCADE`**: For created_by_user_id and notification.user_id, if the referenced user is deleted, all their associated tasks/notifications are also deleted. Be careful with CASCADE!

- **Default Values (`DEFAULT ...`)**: Provides initial values for columns like status, priority, is_read, created_at, and updated_at.

- **`NOT NULL` Constraints**: Ensures critical fields always have values.

- **`UNIQUE` Constraints**: Guarantees no two users can have the same username or email.

- **Indexes (`CREATE INDEX`)**: Improves query performance on frequently searched or joined columns.

- **`updated_at` Trigger**: Automatically updates the updated_at timestamp whenever a row is modified in users or tasks. This is super handy for tracking changes.

![ER Database Diagram](./static/schema_ER_diagram.png)

## Compile and run the project

You need [Docker](https://docs.docker.com/install/) eand [Docker Compose](https://docs.docker.com/compose/install/) installed.

**In the project's root folder, rename the file [.env-example](./.env-example) to `.env`**:

```bash
$ mv .env-example .env
```

Create the image and start the container:

```bash
$ docker-compose up -d --build
```

## Run tests

```bash
# unit tests
$ npm run test
```

The output:

```bash
> mlocks-task-manager@0.0.1 test
> jest

 PASS  apps/task-service/task/task.service.spec.ts
 PASS  apps/user-service/user/user.controller.spec.ts (5.039 s)
  ● Console

    console.log
      [dotenv@17.3.1] injecting env (14) from .env -- tip: 🤖 agentic secret storage: https://dotenvx.com/as2

      at _log (node_modules/dotenv/lib/main.js:139:11)

 PASS  apps/task-service/task/task.controller.spec.ts (5.112 s)
  ● Console

    console.log
      [dotenv@17.3.1] injecting env (14) from .env -- tip: ⚙️  override existing env vars with { override: true }

      at _log (node_modules/dotenv/lib/main.js:139:11)

 PASS  apps/notification-service/notification/notification.controller.spec.ts
 PASS  libs/mail/mail.service.spec.ts
 PASS  apps/notification-service/notification/notification.service.spec.ts
 PASS  apps/user-service/user/user.service.spec.ts
  ● Console

    console.log
      User juliano created. Emitted 'user.created' event.

      at UserService.create (apps/user-service/user/user.service.ts:88:17)

 PASS  libs/database/database.service.spec.ts

Test Suites: 8 passed, 8 total
Tests:       94 passed, 94 total
Snapshots:   0 total
Time:        6.001 s
Ran all test suites.
```

## Test coverage

```bash
# test coverage
$ npm run test:cov
```

The output:

```bash
> mlocks-task-manager@0.0.1 test:cov
> jest --coverage

 PASS  libs/database/database.service.spec.ts
 PASS  apps/task-service/task/task.controller.spec.ts (5.712 s)
 PASS  apps/user-service/user/user.controller.spec.ts (5.75 s)
 PASS  apps/notification-service/notification/notification.controller.spec.ts
 PASS  apps/task-service/task/task.service.spec.ts
 PASS  apps/notification-service/notification/notification.service.spec.ts
 PASS  apps/user-service/user/user.service.spec.ts
  ● Console

    console.log
      User juliano created.Emitted 'user.created' event.

      at UserService.log [as create] (apps/user-service/user/user.service.ts:67:17)

----------------------------------------|---------|----------|---------|---------|-------------------
File                                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------------------------|---------|----------|---------|---------|-------------------
All files                               |   63.12 |    59.57 |   72.72 |   64.69 |                   
 apps/notification-service              |       0 |      100 |       0 |       0 |                   
  app.module.ts                         |       0 |      100 |     100 |       0 | 24-45             
  main.ts                               |       0 |      100 |       0 |       0 | 24-48             
 apps/notification-service/notification |     100 |      100 |     100 |     100 |                   
  notification.controller.ts            |     100 |      100 |     100 |     100 |                   
  notification.entity.ts                |     100 |      100 |     100 |     100 |                   
  notification.service.ts               |     100 |      100 |     100 |     100 |                   
 apps/task-service                      |       0 |        0 |       0 |       0 |                   
  app.module.ts                         |       0 |      100 |     100 |       0 | 24-40             
  main.ts                               |       0 |        0 |       0 |       0 | 24-41             
 apps/task-service/task                 |   89.09 |    92.85 |   96.15 |   90.19 |                   
  task.controller.ts                    |     100 |      100 |     100 |     100 |                   
  task.entity.ts                        |     100 |      100 |     100 |     100 |                   
  task.module.ts                        |       0 |      100 |       0 |       0 | 24-57             
  task.service.ts                       |   97.77 |       90 |     100 |   97.67 | 129               
 apps/task-service/task/dto             |      90 |      100 |       0 |     100 |                   
  create-task.dto.ts                    |   83.33 |      100 |       0 |     100 |                   
  update-task.dto.ts                    |     100 |      100 |     100 |     100 |                   
 apps/user-service                      |       0 |        0 |       0 |       0 |                   
  app.module.ts                         |       0 |      100 |     100 |       0 | 24-42             
  constants.ts                          |       0 |        0 |     100 |       0 | 24-32             
  main.ts                               |       0 |        0 |       0 |       0 | 24-52             
 apps/user-service/auth                 |       0 |        0 |       0 |       0 |                   
  auth.controller.ts                    |       0 |        0 |       0 |       0 | 24-89             
  auth.module.ts                        |       0 |      100 |     100 |       0 | 24-46             
  auth.service.ts                       |       0 |        0 |       0 |       0 | 24-63             
  jwt.strategy.ts                       |       0 |      100 |       0 |       0 | 24-42             
 apps/user-service/auth/dto             |       0 |      100 |     100 |       0 |                   
  login.dto.ts                          |       0 |      100 |     100 |       0 | 24-39             
 apps/user-service/user                 |   85.18 |       90 |   92.85 |    86.3 |                   
  user.controller.ts                    |     100 |      100 |     100 |     100 |                   
  user.entity.ts                        |     100 |      100 |     100 |     100 |                   
  user.module.ts                        |       0 |      100 |       0 |       0 | 24-57             
  user.service.ts                       |   97.36 |       90 |     100 |   97.22 | 96                
 apps/user-service/user/dto             |     100 |      100 |     100 |     100 |                   
  create-user.dto.ts                    |     100 |      100 |     100 |     100 |                   
  update-user.dto.ts                    |     100 |      100 |     100 |     100 |                   
 libs/database                          |    28.2 |        0 |   44.44 |   25.71 |                   
  database.interface.ts                 |     100 |      100 |     100 |     100 |                   
  database.module.ts                    |       0 |        0 |       0 |       0 | 24-40             
  database.providers.ts                 |       0 |      100 |       0 |       0 | 24-67             
  database.service.ts                   |     100 |      100 |     100 |     100 |                   
  index.ts                              |       0 |      100 |     100 |       0 | 24-27             
----------------------------------------|---------|----------|---------|---------|-------------------

Test Suites: 7 passed, 7 total
Tests:       89 passed, 89 total
Snapshots:   0 total
Time:        12.182 s
Ran all test suites.

```

## License

This project uses a [MIT licensed](https://github.com/julianomacielferreira/mlocks-task-manager/blob/master/LICENSE).
