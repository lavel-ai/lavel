import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { keys } from '../../keys';
import * as schema from './schema';

const client = neon(keys().DATABASE_URL);

export const db = drizzle(client, { schema });
