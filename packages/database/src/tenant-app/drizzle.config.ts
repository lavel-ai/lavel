import { defineConfig } from 'drizzle-kit';
import { keys } from '../../keys';
export default defineConfig({
  schema: './schema/**/index.ts',
  out: './.drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: keys().TEST_DATABASE_URL,
  },
});
