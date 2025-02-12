
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';


export const keys = () =>
  createEnv({
    server: {
      DATABASE_URL: z.string().min(1).url(),
      NEON_API_KEY: z.string().min(1),
      TEST_DATABASE_URL: z.string().min(1).url(),
    },
    runtimeEnv: {
      DATABASE_URL: process.env.DATABASE_URL,
      NEON_API_KEY: process.env.NEON_API_KEY,
      TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
    },
  });
