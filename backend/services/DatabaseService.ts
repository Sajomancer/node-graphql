import { Pool } from "pg";

export class DatabaseService {
  private pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl,
    });
  }

  async query(text: string, params?: unknown[]) {
    return this.pool.query(text, params);
  }

  async close() {
    return this.pool.end();
  }
}
