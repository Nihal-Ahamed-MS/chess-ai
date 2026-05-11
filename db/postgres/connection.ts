import { Pool } from 'pg';

let pool: Pool | null = null;

export function getGameDb(): Pool {
    if (!pool) {
        pool = new Pool({ connectionString: process.env.GAME_DB_URL });
    }
    return pool;
}
