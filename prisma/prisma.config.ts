import { defineConfig, env } from "@prisma/internals";

export default defineConfig({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});
