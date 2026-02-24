Database shared module
======================

Purpose
-------
- Centralize Postgres/DataSource configuration and providers used by multiple microservices.
- Provide a single import surface so consumers don't duplicate connection setup.

Public exports
--------------
- `DatabaseModule` — dynamic/global Nest module. Call `DatabaseModule.forRootAsync()` in your service `AppModule` imports.
- `DATABASE_CONNECTION` — injection token for the `IDatabaseConnection` wrapper around TypeORM `DataSource`.
- `PG_POOL` — injection token for a `pg.Pool` instance (if you prefer raw SQL queries).
- `DatabaseService` — small wrapper exposing `query()` and `transaction()` convenience methods.

Import example
--------------
From a microservice `app.module.ts` (relative import):

```ts
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../common/database';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forRootAsync(),
    // keep TypeOrmModule.forFeature([...]) in feature modules if you use repositories
  ],
})
export class AppModule {}
```

Notes on `TypeOrmModule.forFeature`
----------------------------------
`DatabaseModule` now registers `TypeOrmModule.forRootAsync(...)` internally and exports `TypeOrmModule`, so modules using `TypeOrmModule.forFeature()` continue to work without per-service `forRoot` configuration.

Testing helpers
---------------
- To run unit tests without a real Postgres instance, provide a test provider in your test module that binds `DATABASE_CONNECTION` to a mock implementation (or an in-memory SQLite DataSource):

```ts
const mockDbProvider = {
  provide: DATABASE_CONNECTION,
  useValue: { getDataSource: () => mockDataSource },
};

Test.createTestingModule({
  imports: [ConfigModule.forRoot()],
  providers: [mockDbProvider, /* your providers */],
}).compile();
```

Or add a `DatabaseModule.forRootTest()` factory (optional) that returns a module configured with sqlite and `synchronize: true` for fast ephemeral tests.

Best practices
--------------
- Keep `DatabaseModule` free of business logic.
- Avoid circular imports: the database layer should not import application modules that depend on it.
- Prefer `synchronize: false` in production and use migrations.
