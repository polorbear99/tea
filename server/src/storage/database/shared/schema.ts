import { pgTable, serial, varchar, text, timestamp, integer, numeric, jsonb, boolean, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// Keep system table
export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ====== Customers (consumers) ======
export const customers = pgTable(
  "customers",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    open_id: varchar("open_id", { length: 128 }).notNull().unique(),
    union_id: varchar("union_id", { length: 128 }),
    nickname: varchar("nickname", { length: 128 }),
    avatar_url: text("avatar_url"),
    phone: varchar("phone", { length: 20 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("customers_open_id_idx").on(table.open_id),
    index("customers_union_id_idx").on(table.union_id),
  ]
);

// ====== Product Categories ======
export const productCategories = pgTable(
  "product_categories",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 64 }).notNull(),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("product_categories_sort_idx").on(table.sort_order),
  ]
);

// ====== Products (SPU) ======
export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    biz_id: varchar("biz_id", { length: 32 }).notNull().unique(),
    name: varchar("name", { length: 200 }).notNull(),
    category_id: varchar("category_id", { length: 36 }).references(() => productCategories.id),
    tea_type: varchar("tea_type", { length: 32 }),
    variety: varchar("variety", { length: 100 }),
    origin: varchar("origin", { length: 200 }),
    year: varchar("year", { length: 10 }),
    craft: varchar("craft", { length: 100 }),
    aroma: varchar("aroma", { length: 100 }),
    taste: varchar("taste", { length: 100 }),
    strength: integer("strength").default(3),
    bitterness: integer("bitterness").default(3),
    aroma_intensity: integer("aroma_intensity").default(3),
    beginner_friendly: integer("beginner_friendly").default(3),
    scenes: text("scenes"),
    recommended_for: text("recommended_for"),
    selling_points: text("selling_points"),
    description: text("description"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    cover_image: text("cover_image"),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("products_biz_id_idx").on(table.biz_id),
    index("products_category_id_idx").on(table.category_id),
    index("products_status_idx").on(table.status),
    index("products_tea_type_idx").on(table.tea_type),
    index("products_sort_idx").on(table.sort_order),
  ]
);

// ====== Product SKUs ======
export const productSkus = pgTable(
  "product_skus",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    biz_id: varchar("biz_id", { length: 32 }).notNull().unique(),
    product_id: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    spec_name: varchar("spec_name", { length: 100 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    stock: integer("stock").notNull().default(0),
    image: text("image"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("product_skus_biz_id_idx").on(table.biz_id),
    index("product_skus_product_id_idx").on(table.product_id),
  ]
);

// ====== Product Brewing Info ======
export const productBrewing = pgTable(
  "product_brewing",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    product_id: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    teaware: varchar("teaware", { length: 200 }),
    tea_amount: varchar("tea_amount", { length: 50 }),
    water_amount: varchar("water_amount", { length: 50 }),
    water_temp: varchar("water_temp", { length: 50 }),
    brew_time: varchar("brew_time", { length: 100 }),
    recommended_infusions: varchar("recommended_infusions", { length: 50 }),
    tips: text("tips"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("product_brewing_product_id_idx").on(table.product_id),
  ]
);

// ====== Product Media (images) ======
export const productMedia = pgTable(
  "product_media",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    product_id: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    type: varchar("type", { length: 20 }).notNull().default("image"),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("product_media_product_id_idx").on(table.product_id),
  ]
);

// ====== Product QR Codes ======
export const productQrcodes = pgTable(
  "product_qrcodes",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    product_id: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 64 }).notNull().unique(),
    scan_count: integer("scan_count").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("product_qrcodes_code_idx").on(table.code),
    index("product_qrcodes_product_id_idx").on(table.product_id),
  ]
);

// ====== Orders ======
export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    order_no: varchar("order_no", { length: 32 }).notNull().unique(),
    customer_id: varchar("customer_id", { length: 36 }).notNull().references(() => customers.id),
    order_type: varchar("order_type", { length: 20 }).notNull().default("retail"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    total_amount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    address_name: varchar("address_name", { length: 64 }),
    address_phone: varchar("address_phone", { length: 20 }),
    address_detail: text("address_detail"),
    remark: text("remark"),
    merchant_note: text("merchant_note"),
    express_company: varchar("express_company", { length: 64 }),
    express_no: varchar("express_no", { length: 64 }),
    paid_at: timestamp("paid_at", { withTimezone: true }),
    shipped_at: timestamp("shipped_at", { withTimezone: true }),
    completed_at: timestamp("completed_at", { withTimezone: true }),
    cancelled_at: timestamp("cancelled_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("orders_order_no_idx").on(table.order_no),
    index("orders_customer_id_idx").on(table.customer_id),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.created_at),
  ]
);

// ====== Order Items ======
export const orderItems = pgTable(
  "order_items",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    order_id: varchar("order_id", { length: 36 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 36 }).notNull(),
    sku_id: varchar("sku_id", { length: 36 }).notNull(),
    product_name: varchar("product_name", { length: 200 }).notNull(),
    sku_name: varchar("sku_name", { length: 100 }).notNull(),
    cover_image: text("cover_image"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.order_id),
    index("order_items_product_id_idx").on(table.product_id),
  ]
);

// ====== Knowledge Documents ======
export const knowledgeDocuments = pgTable(
  "knowledge_documents",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    type: varchar("type", { length: 32 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("knowledge_documents_type_idx").on(table.type),
  ]
);

// ====== AI Conversations ======
export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    customer_id: varchar("customer_id", { length: 36 }).references(() => customers.id),
    type: varchar("type", { length: 32 }).notNull(),
    product_id: varchar("product_id", { length: 36 }),
    title: varchar("title", { length: 200 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("ai_conversations_customer_id_idx").on(table.customer_id),
    index("ai_conversations_type_idx").on(table.type),
  ]
);

// ====== AI Messages ======
export const aiMessages = pgTable(
  "ai_messages",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    conversation_id: varchar("conversation_id", { length: 36 }).notNull().references(() => aiConversations.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).notNull(),
    content: text("content").notNull(),
    image_url: text("image_url"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("ai_messages_conversation_id_idx").on(table.conversation_id),
  ]
);

// ====== Shop Config ======
export const shopConfig = pgTable(
  "shop_config",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    key: varchar("key", { length: 64 }).notNull().unique(),
    value: text("value"),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("shop_config_key_idx").on(table.key),
  ]
);

// ====== Business Events ======
export const businessEvents = pgTable(
  "business_events",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    event_type: varchar("event_type", { length: 40 }).notNull(),
    entity_type: varchar("entity_type", { length: 40 }).notNull(),
    entity_id: varchar("entity_id", { length: 36 }).notNull(),
    payload: jsonb("payload"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("business_events_type_idx").on(table.event_type),
    index("business_events_entity_idx").on(table.entity_type, table.entity_id),
    index("business_events_created_at_idx").on(table.created_at),
  ]
);
