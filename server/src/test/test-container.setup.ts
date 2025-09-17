// test/test-container.setup.ts
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

let container: StartedPostgreSqlContainer;

export async function startPostgresContainer() {
  container = await new PostgreSqlContainer('postgres:15-alpine')
    .withDatabase('school_test')
    .withUsername('testuser')
    .withPassword('testpass')
    .start();

  return {
    host: container.getHost(),
    port: container.getMappedPort(5432),
    username: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
  };
}

export async function stopPostgresContainer() {
  if (container) {
    await container.stop();
  }
}
