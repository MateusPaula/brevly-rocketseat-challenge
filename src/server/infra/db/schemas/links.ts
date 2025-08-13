import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const links = pgTable('links', {
    shortUrl: text('short_url').notNull().primaryKey(),
    originalUrl: text('original_url').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    visits: integer('visits').notNull().default(0),
})