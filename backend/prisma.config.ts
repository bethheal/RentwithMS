import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

const cliDatabaseUrl = process.env.DIRECT_URL || env("DATABASE_URL");

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  datasource: {
    url: cliDatabaseUrl,
  },

  migrate: {
    async adapter(env) {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      return new PrismaPg({
        connectionString: env.DIRECT_URL || env.DATABASE_URL,
      });
    },
  },
});
