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

## Swagger Documentation

Open the brownser in **http://localhost:3000/api** and you will see the swagger documentation.

![Swagger Documentation](./static/swagger-docs.png)

## RabbitMQ Management

Open your browser to **http://localhost:15672/#/queues** and you will see RabbitMQ Management.

The login is `guest` and the password is `guest`.

![RabbitMQ Management](./static/rabbitMQ.png)

## MailHog

Open your browser to **http://localhost:8025/** and you will see Mailhog for sending emails.

![Mailhog](./static/mailhog.png)

## Endpoints

A Postman collection of endpoints is located in the file [MLocks_Mini_Ledger.postman_collection.json](./static/MLocks-Task-Manager.postman_collection.json) and below are example cURL calls to the endpoints.

### 1. Users

- **New user: POST `/users`**
  
```bash
$ curl --location 'http://localhost:3000/users' \
--header 'Content-Type: application/json' \
--data-raw '{
    "roleId": 1,
    "username": "julianoEXE",
    "email": "juliano.maciel.ferreiraCOM@gmail.com",
    "password": "password",
    "firstName": "Juliano",
    "lastName": "Ferreira"
}'
```
<details>
<summary><b>Response</b></summary>

```json
{
    "id": 17,
    "username": "julianoJBOD",
    "email": "juliano.maciel.ferreiraSMTP@gmail.com",
    "firstName": "Juliano",
    "lastName": "Ferreira",
    "role": {
        "id": 1,
        "type": "admin"
    },
    "createdAt": "2026-03-22T23:55:53.991Z",
    "updatedAt": "2026-03-22T23:55:53.991Z"
}
```
</details>

---

- **Login: POST `/auth/login`**
  
```bash
$ curl --location 'http://localhost:3000/auth/login' \
--header 'Content-Type: application/json' \
--data '{
    "username": "julianoJSON",
    "password": "password"
}'
```
<details>
<summary><b>Response</b></summary>

```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp1bGlhbm9KU09OIiwic3ViIjoxMiwiaWF0IjoxNzc0MjI0NDU0LCJleHAiOjE3NzQyMjgwNTR9.MyOOXCLyknUmjOBHcEns0Fo2B50ApCTRaGt6hMj-aog"
}
```
</details>

---

- **Retrieve authenticated user profile: POST `/auth/profile`**
  
```bash
$ curl --location --request POST 'http://localhost:3000/auth/profile' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp1bGlhbm9KU09OIiwic3ViIjoxMiwiaWF0IjoxNzc0MjI2ODg2LCJleHAiOjE3NzQyMzA0ODZ9.y5HVjv7E1atKmTzNOateK1I2QqJOvvTzCbGzjTP7PoY'
```
<details>
<summary><b>Response</b></summary>

```json
{
    "id": 12,
    "username": "julianoJSON",
    "email": "juliano.maciel.ferreiraXML@gmail.com",
    "firstName": "Juliano",
    "lastName": "Ferreira",
    "createdAt": "2026-03-03T21:07:56.729Z",
    "updatedAt": "2026-03-03T21:07:56.729Z",
    "deletedAt": null,
    "role": {
        "id": 1,
        "type": "admin",
        "description": "Administrator with full access",
        "createdAt": "2026-03-03T01:01:48.050Z",
        "updatedAt": "2026-03-03T01:01:48.050Z"
    }
}
```
</details>

---

- **List all Users (admin only): GET `/users`**
  
```bash
$ curl --location 'http://localhost:3000/users' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp1bGlhbm9KU09OIiwic3ViIjoxMiwiaWF0IjoxNzc0MjI2ODg2LCJleHAiOjE3NzQyMzA0ODZ9.y5HVjv7E1atKmTzNOateK1I2QqJOvvTzCbGzjTP7PoY'
```
<details>
<summary><b>Response</b></summary>

```json
[
    {
        "id": 6,
        "username": "julianoSSL",
        "email": "juliano.maciel.ferreiraSSL@gmail.com",
        "firstName": "Juliano",
        "lastName": "Ferreira",
        "role": {
            "id": 1,
            "type": "admin"
        },
        "createdAt": "2026-03-03T02:13:33.429Z",
        "updatedAt": "2026-03-03T02:13:33.429Z"
    },
    {
        "id": 8,
        "username": "julianoEXE",
        "email": "juliano.maciel.ferreiraPCI@gmail.com",
        "firstName": "Juliano",
        "lastName": "Ferreira",
        "role": {
            "id": 3,
            "type": "user"
        },
        "createdAt": "2026-03-03T02:13:44.498Z",
        "updatedAt": "2026-03-03T02:13:44.498Z"
    }
]
```
</details>

---

- **Find user (admin only): GET `/users/:id`**
  
```bash
$ curl --location 'http://localhost:3000/users/6' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp1bGlhbm9KU09OIiwic3ViIjoxMiwiaWF0IjoxNzc0Mjg4Mjk1LCJleHAiOjE3NzQyOTE4OTV9.eRkfjPo-2Xou2IlIIZKZZWzzi5EWV6NxXhd6Vv4h85A'
```
<details>
<summary><b>Response</b></summary>

```json
{
    "id": 6,
    "username": "julianoSSL",
    "email": "juliano.maciel.ferreiraSSL@gmail.com",
    "firstName": "Juliano",
    "lastName": "Ferreira",
    "role": {
        "id": 1,
        "type": "admin"
    },
    "createdAt": "2026-03-03T02:13:33.429Z",
    "updatedAt": "2026-03-03T02:13:33.429Z"
}
```
</details>

---

- **Update user: PUT `/users/:id`**
  
```bash
$ curl --location --request PUT 'http://localhost:3000/users/12' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp1bGlhbm9KU09OIiwic3ViIjoxMiwiaWF0IjoxNzc0Mjg4Mjk1LCJleHAiOjE3NzQyOTE4OTV9.eRkfjPo-2Xou2IlIIZKZZWzzi5EWV6NxXhd6Vv4h85A' \
--data-raw '{
    "username": "julianoJSON",
    "email": "juliano.maciel.ferreiraXML@gmail.com",
    "password": "password",
    "firstName": "Juliano",
    "lastName": "Ferreira"
}'
```
<details>
<summary><b>Response</b></summary>

```json
{
    "id": 12,
    "username": "julianoJSON",
    "email": "juliano.maciel.ferreiraXML@gmail.com",
    "firstName": "Juliano",
    "lastName": "Ferreira",
    "role": {
        "id": 1,
        "type": "admin"
    },
    "createdAt": "2026-03-03T21:07:56.729Z",
    "updatedAt": "2026-03-23T18:19:49.470Z"
}
```
</details>

---

- **Update authenticated user: PUT `/users/me`**
  
```bash
$ curl --location --request PUT 'http://localhost:3000/users/me' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp1bGlhbm9KU09OIiwic3ViIjoxMiwiaWF0IjoxNzc0Mjg4Mjk1LCJleHAiOjE3NzQyOTE4OTV9.eRkfjPo-2Xou2IlIIZKZZWzzi5EWV6NxXhd6Vv4h85A' \
--data-raw '{
    "username": "julianoJSON",
    "email": "juliano.maciel.ferreiraXML@gmail.com",
    "password": "password",
    "firstName": "Juliano",
    "lastName": "Ferreira"
}'
```
<details>
<summary><b>Response</b></summary>

```json
{
    "id": 12,
    "username": "julianoJSON",
    "email": "juliano.maciel.ferreiraXML@gmail.com",
    "firstName": "Juliano",
    "lastName": "Ferreira",
    "role": {
        "id": 1,
        "type": "admin"
    },
    "createdAt": "2026-03-03T21:07:56.729Z",
    "updatedAt": "2026-03-23T18:29:06.054Z"
}
```
</details>

---

- **Soft delete user (admin only): DELETE `/users/:id`**
  
```bash
$ curl --location --request DELETE 'http://localhost:3000/users/12' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp1bGlhbm9KU09OIiwic3ViIjoxMiwiaWF0IjoxNzc0MjkwNzkzLCJleHAiOjE3NzQyOTQzOTN9.gvYoaosbulZ85_uKhV-K0q8LY3Nd8DRuFAEe-L6Axhk'
```
---

## Run tests

```bash
# unit tests
$ npm run test
```

The output:

```bash
> mlocks-task-manager@0.0.1 test
> jest

 PASS  apps/task-service/task/task.service.spec.ts (5.027 s)
 PASS  apps/user-service/user/user.controller.spec.ts (5.275 s)
  ● Console

    console.log
      [dotenv@17.3.1] injecting env (14) from .env -- tip: ⚙️  enable debug logging with { debug: true }

      at _log (node_modules/dotenv/lib/main.js:139:11)

 PASS  apps/notification-service/notification/notification.controller.spec.ts
 PASS  apps/task-service/task/task.controller.spec.ts (5.459 s)
  ● Console

    console.log
      [dotenv@17.3.1] injecting env (14) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }

      at _log (node_modules/dotenv/lib/main.js:139:11)

 PASS  libs/database/database.service.spec.ts
 PASS  apps/notification-service/notification/notification.service.spec.ts
 PASS  apps/user-service/user/user.service.spec.ts
  ● Console

    console.log
      User juliano created. Emitted 'user.created' event.

      at UserService.create (apps/user-service/user/user.service.ts:88:17)

 PASS  libs/mail/mail.service.spec.ts

Test Suites: 8 passed, 8 total
Tests:       94 passed, 94 total
Snapshots:   0 total
Time:        6.384 s, estimated 7 s
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

 PASS  apps/task-service/task/task.service.spec.ts (5.376 s)
 PASS  apps/task-service/task/task.controller.spec.ts (6.068 s)
  ● Console

    console.log
      [dotenv@17.3.1] injecting env (14) from .env -- tip: 🛡️ auth for agents: https://vestauth.com

      at _log (node_modules/dotenv/lib/main.js:139:11)

 PASS  apps/user-service/user/user.controller.spec.ts (6.311 s)
  ● Console

    console.log
      [dotenv@17.3.1] injecting env (14) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild

      at _log (node_modules/dotenv/lib/main.js:139:11)

 PASS  apps/notification-service/notification/notification.controller.spec.ts
 PASS  apps/notification-service/notification/notification.service.spec.ts
 PASS  libs/mail/mail.service.spec.ts
 PASS  apps/user-service/user/user.service.spec.ts
  ● Console

    console.log
      User juliano created. Emitted 'user.created' event.

      at UserService.log [as create] (apps/user-service/user/user.service.ts:88:17)

 PASS  libs/database/database.service.spec.ts
----------------------------------------|---------|----------|---------|---------|--------------------
File                                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s  
----------------------------------------|---------|----------|---------|---------|--------------------
All files                               |   61.05 |    37.61 |   65.95 |   61.44 |                    
 apps/docs-aggregator                   |       0 |        0 |       0 |       0 |                    
  main.ts                               |       0 |        0 |       0 |       0 | 24-52              
  merge-openapi.ts                      |       0 |        0 |       0 |       0 | 24-74              
 apps/notification-service              |       0 |        0 |       0 |       0 |                    
  app.module.ts                         |       0 |      100 |     100 |       0 | 24-42              
  main.ts                               |       0 |        0 |       0 |       0 | 24-82              
 apps/notification-service/notification |   91.93 |      100 |     100 |   92.98 |                    
  notification.controller.ts            |     100 |      100 |     100 |     100 |                    
  notification.entity.ts                |     100 |      100 |     100 |     100 |                    
  notification.module.ts                |       0 |      100 |     100 |       0 | 24-41              
  notification.service.ts               |     100 |      100 |     100 |     100 |                    
  user-projection.entity.ts             |     100 |      100 |     100 |     100 |                    
 apps/task-service                      |       0 |        0 |       0 |       0 |                    
  app.module.ts                         |       0 |      100 |     100 |       0 | 24-40              
  constants.ts                          |       0 |        0 |     100 |       0 | 24-32              
  main.ts                               |       0 |        0 |       0 |       0 | 24-69              
 apps/task-service/task                 |   86.06 |    93.33 |    86.2 |   86.84 |                    
  task.controller.ts                    |     100 |      100 |     100 |     100 |                    
  task.entity.ts                        |     100 |      100 |     100 |     100 |                    
  task.module.ts                        |       0 |      100 |       0 |       0 | 24-59              
  task.service.ts                       |   90.56 |     90.9 |      80 |   90.19 | 86,150,162-165,179 
 apps/task-service/task/dto             |   89.47 |      100 |       0 |     100 |                    
  create-task.dto.ts                    |   81.81 |      100 |       0 |     100 |                    
  update-task.dto.ts                    |     100 |      100 |     100 |     100 |                    
 apps/user-service                      |       0 |        0 |       0 |       0 |                    
  app.module.ts                         |       0 |      100 |     100 |       0 | 24-42              
  main.ts                               |       0 |        0 |       0 |       0 | 24-69              
 apps/user-service/auth                 |      16 |        0 |      10 |   14.92 |                    
  admin.guard.ts                        |   44.44 |        0 |       0 |    37.5 | 35-58              
  auth.controller.ts                    |       0 |        0 |       0 |       0 | 24-89              
  auth.module.ts                        |       0 |      100 |     100 |       0 | 24-39              
  auth.service.ts                       |       0 |        0 |       0 |       0 | 24-63              
  auth.utils.ts                         |   66.66 |        0 |     100 |   66.66 | 29,32              
 apps/user-service/user                 |   83.59 |       80 |   83.33 |   83.76 |                    
  role.entity.ts                        |     100 |      100 |     100 |     100 |                    
  user.controller.ts                    |   89.18 |        0 |    87.5 |   88.23 | 93-94,104-105      
  user.entity.ts                        |   93.75 |      100 |       0 |   92.85 | 66                 
  user.module.ts                        |       0 |      100 |       0 |       0 | 24-59              
  user.service.ts                       |   93.87 |    82.35 |     100 |   93.61 | 63-66              
 apps/user-service/user/dto             |     100 |      100 |     100 |     100 |                    
  create-user.dto.ts                    |     100 |      100 |     100 |     100 |                    
  role-response.dto.ts                  |     100 |      100 |     100 |     100 |                    
  update-user.dto.ts                    |     100 |      100 |     100 |     100 |                    
  user-response.dto.ts                  |     100 |      100 |     100 |     100 |                    
 libs/auth                              |   71.42 |        0 |       0 |    67.5 |                    
  auth.module.ts                        |     100 |      100 |     100 |     100 |                    
  constants.ts                          |      80 |        0 |     100 |      80 | 29                 
  index.ts                              |     100 |      100 |     100 |     100 |                    
  jwt-auth.guard.ts                     |     100 |      100 |     100 |     100 |                    
  jwt.strategy.ts                       |   77.77 |      100 |       0 |   71.42 | 33-42              
  owner.guard.ts                        |   26.66 |        0 |       0 |   16.66 | 35-53              
 libs/auth/decorator                    |   33.33 |        0 |       0 |   33.33 |                    
  current-user.decorator.ts             |   33.33 |        0 |       0 |   33.33 | 31-37              
 libs/auth/dto                          |     100 |      100 |     100 |     100 |                    
  login.dto.ts                          |     100 |      100 |     100 |     100 |                    
 libs/database                          |    28.2 |        0 |   44.44 |   25.71 |                    
  database.interface.ts                 |     100 |      100 |     100 |     100 |                    
  database.module.ts                    |       0 |        0 |       0 |       0 | 24-40              
  database.providers.ts                 |       0 |      100 |       0 |       0 | 24-67              
  database.service.ts                   |     100 |      100 |     100 |     100 |                    
  index.ts                              |       0 |      100 |     100 |       0 | 24-27              
 libs/mail                              |   75.86 |      100 |     100 |      80 |                    
  index.ts                              |       0 |      100 |     100 |       0 | 24-25              
  mail.module.ts                        |       0 |      100 |     100 |       0 | 24-32              
  mail.service.ts                       |     100 |      100 |     100 |     100 |                    
----------------------------------------|---------|----------|---------|---------|--------------------

Test Suites: 8 passed, 8 total
Tests:       94 passed, 94 total
Snapshots:   0 total
Time:        12.876 s
Ran all test suites.

```

## License

This project uses a [MIT licensed](https://github.com/julianomacielferreira/mlocks-task-manager/blob/master/LICENSE).
