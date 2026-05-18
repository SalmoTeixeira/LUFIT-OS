import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { seedDatabase } from "./seed.js";

// ── Database connection ────────────────────────────────────────
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  prepare: false,
});
const db = drizzle(sql);

// ── Hono app ──────────────────────────────────────────────────
const app = new Hono();
app.use(cors());

// Health check
app.get("/api/health", async (c) => {
  try {
    await sql`SELECT 1`;
    return c.json({
      status: "ok",
      service: "lufit-os",
      version: "4.0.0",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return c.json({
      status: "error",
      database: err.message,
    }, 500);
  }
});

// Test database connection and list tables
app.get("/api/db-test", async (c) => {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    return c.json({
      status: "ok",
      tables: tables.map((t: any) => t.table_name),
      count: tables.length,
    });
  } catch (err: any) {
    return c.json({ status: "error", message: err.message }, 500);
  }
});

// Get products
app.get("/api/products", async (c) => {
  try {
    const products = await sql`
      SELECT * FROM products 
      WHERE is_active = true 
      ORDER BY name 
      LIMIT 50
    `;
    return c.json({ products });
  } catch (err: any) {
    return c.json({ status: "error", message: err.message }, 500);
  }
});

// Get categories
app.get("/api/categories", async (c) => {
  try {
    const categories = await sql`
      SELECT * FROM categories 
      ORDER BY name
    `;
    return c.json({ categories });
  } catch (err: any) {
    return c.json({ status: "error", message: err.message }, 500);
  }
});

// Seed endpoint
app.get("/api/seed", async (c) => {
  try {
    const result = await seedDatabase();
    return c.json({ status: "ok", seeded: result });
  } catch (err: any) {
    return c.json({ status: "error", message: err.message }, 500);
  }
});

// 404 handler
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Vercel handler
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);

export default app;
