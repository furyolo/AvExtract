import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const avmovie = pgTable('avmovie', {
  code: varchar('code', { length: 50 }).primaryKey().notNull(),
  title: text('title').notNull(),
  magnet_link: text('magnet_link'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type AvMovie = typeof avmovie.$inferSelect;
export type NewAvMovie = typeof avmovie.$inferInsert;
