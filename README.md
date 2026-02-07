<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Project Overview

The task manager application will have the following features:

- User Service: handles user registration, login, and profile management
- Task Service: manages tasks, including creation, assignment, and status updates
- Notification Service: sends notifications to users when tasks are assigned or updated

Technologies Used

- NestJS: a progressive Node.js framework for building efficient and scalable server-side applications

- Postgres: a powerful, open-source relational database
- RabbitMQ: a message broker for handling communication between services
- Docker: for containerization and deployment

Security Features

- JWT Authentication: secure user authentication using JSON Web Tokens
- Role-Based Access Control: restrict access to certain features based on user roles
- Input Validation: validate user input to prevent SQL injection and cross-site scripting (XSS)
- Encryption: encrypt sensitive data, such as passwords and notification tokens

Deployment Specifications

- Docker Compose: for orchestrating containers and managing dependencies
- Kubernetes: for scaling and managing containers in production
- Environment Variables: for storing sensitive data, such as database credentials and API keys

A high-level architecture diagram:

```
+---------------+
|  User Service  |
+---------------+
           |
           |  RabbitMQ
           v
+---------------+
| Task Service  |
+---------------+
           |
           |  Postgres
           v
+---------------+
| Notification  |
|  Service       |
+---------------+
```

The directory structure of the project:

```
task-manager/
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── .env
│   └── .dockerignore
├── src/
│   ├── user-service/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── user/
│   │   │   ├── user.entity.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.controller.ts
│   │   └── ...
│   ├── task-service/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── task/
│   │   │   ├── task.entity.ts
│   │   │   ├── task.service.ts
│   │   │   └── task.controller.ts
│   │   └── ...
│   ├── notification-service/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── notification/
│   │   │   ├── notification.entity.ts
│   │   │   ├── notification.service.ts
│   │   │   └── notification.controller.ts
│   │   └── ...
│   └── ...
├── package.json
├── tsconfig.json
└── .gitignore
```

## Database Structure

Explanation of Tables and Columns:

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
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, never plain text!
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

- Primary Keys (SERIAL PRIMARY KEY): Ensures each record has a unique identifier and automatically increments.

- Foreign Keys (FOREIGN KEY ... REFERENCES ...): Establishes relationships between tables (tasks to users, notifications to users and tasks).

- ON DELETE SET NULL: For assigned_to_user_id and notification.task_id, if the referenced user/task is deleted, the foreign key column is set to NULL.

- ON DELETE CASCADE: For created_by_user_id and notification.user_id, if the referenced user is deleted, all their associated tasks/notifications are also deleted. Be careful with CASCADE!

- Default Values (DEFAULT ...): Provides initial values for columns like status, priority, is_read, created_at, and updated_at.

- NOT NULL Constraints: Ensures critical fields always have values.

- UNIQUE Constraints: Guarantees no two users can have the same username or email.

- Indexes (CREATE INDEX): Improves query performance on frequently searched or joined columns.

- updated_at Trigger: Automatically updates the updated_at timestamp whenever a row is modified in users or tasks. This is super handy for tracking changes.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
