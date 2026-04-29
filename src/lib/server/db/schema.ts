import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Categories for the menu
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

// Menu items
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

// Restaurant Tables
export const tables = sqliteTable('tables', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	qrCode: text('qr_code')
});

export const tablesRelations = relations(tables, ({ many }) => ({
	orders: many(orders)
}));

// Orders
export const orders = sqliteTable('orders', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	tableId: text('table_id')
		.notNull()
		.references(() => tables.id),
	status: text('status', { enum: ['pending', 'processing', 'completed', 'cancelled'] })
		.notNull()
		.default('pending'),
	totalPrice: real('total_price').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
	table: one(tables, {
		fields: [orders.tableId],
		references: [tables.id]
	}),
	items: many(orderItems)
}));

// Items within an order
export const orderItems = sqliteTable('order_items', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	orderId: text('order_id')
		.notNull()
		.references(() => orders.id),
	menuId: text('menu_id')
		.notNull()
		.references(() => menus.id),
	quantity: integer('quantity').notNull(),
	priceAtTime: real('price_at_time').notNull(),
	notes: text('notes')
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	menu: one(menus, {
		fields: [orderItems.menuId],
		references: [menus.id]
	})
}));
