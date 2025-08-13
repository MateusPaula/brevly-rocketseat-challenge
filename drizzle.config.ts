import type { Config } from "drizzle-kit";
import { env } from "@/server/env";


export default {
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    dialect: 'postgresql',
    schema: 'src/server/infra/db/schemas/*',
    out: 'src/server/infra/db/migrations',
} satisfies Config