import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const categories = sqliteTable('categories', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	image: text('image'),
	order: integer('order').default(0)
});

export const categoriesRelations = relations(categories, ({ many }) => ({
	menus: many(menus)
}));

export const menus = sqliteTable('menus', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	categoryId: text('category_id')
		.notNull()
		.references(() => categories.id),
	name: text('name').notNull(),
	description: text('description'),
	price: real('price').notNull(),
	image: text('image'),
	isAvailable: integer('is_available', { mode: 'boolean' }).default(true)
});

export const menusRelations = relations(menus, ({ one }) => ({
	category: one(categories, {
		fields: [menus.categoryId],
		references: [categories.id]
	})
}));

export const tables = sqliteTable('tables', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	qrCode: text('qr_code')
});

export const tablesRelations = relations(tables, ({ many }) => ({
	sessions: many(tableSessions)
}));

// Satu sesi per kunjungan meja. Bisa ada banyak batch order dalam satu sesi.
export const tableSessions = sqliteTable('table_sessions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	tableId: text('table_id')
		.notNull()
		.references(() => tables.id),
	status: text('status', { enum: ['open', 'processing', 'closed', 'cancelled'] }).notNull().default('open'),
	paymentStatus: text('payment_status', { enum: ['unpaid', 'paid'] }).notNull().default('unpaid'),
	paymentMethod: text('payment_method', { enum: ['cash', 'qris', 'transfer'] }),
	totalPrice: real('total_price').notNull().default(0),
	openedAt: integer('opened_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	closedAt: integer('closed_at', { mode: 'timestamp' })
});

export const tableSessionsRelations = relations(tableSessions, ({ one, many }) => ({
	table: one(tables, {
		fields: [tableSessions.tableId],
		references: [tables.id]
	}),
	batches: many(orderBatches)
}));

// Setiap kali customer klik "Place Order" = 1 batch baru dalam sesi aktif
export const orderBatches = sqliteTable('order_batches', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sessionId: text('session_id')
		.notNull()
		.references(() => tableSessions.id),
	status: text('status', { enum: ['pending', 'processing', 'done', 'cancelled'] })
		.notNull()
		.default('pending'),
	totalPrice: real('total_price').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const orderBatchesRelations = relations(orderBatches, ({ one, many }) => ({
	session: one(tableSessions, {
		fields: [orderBatches.sessionId],
		references: [tableSessions.id]
	}),
	items: many(orderItems)
}));

export const orderItems = sqliteTable('order_items', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	batchId: text('batch_id')
		.notNull()
		.references(() => orderBatches.id),
	menuId: text('menu_id')
		.notNull()
		.references(() => menus.id),
	quantity: integer('quantity').notNull(),
	priceAtTime: real('price_at_time').notNull(),
	notes: text('notes')
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	batch: one(orderBatches, {
		fields: [orderItems.batchId],
		references: [orderBatches.id]
	}),
	menu: one(menus, {
		fields: [orderItems.menuId],
		references: [menus.id]
	})
}));
