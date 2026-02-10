// backend/prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // English comment: path to your Prisma schema
  schema: 'prisma/schema.prisma',

  // English comment: database connection used by Prisma CLI (migrate, studio, etc.)
  datasource: {
    url: env('DATABASE_URL'),
  },
});
