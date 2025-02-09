import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './schema/**/index.ts',
  out: './.drizzle',
  dialect: 'postgresql',
});
