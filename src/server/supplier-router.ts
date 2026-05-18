import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { suppliers, supplierContacts } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const supplierRouter = createRouter({
  // Listar fornecedores com paginação e busca
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        type: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { search, status, type, limit = 50, offset = 0 } = input || {};

      const conditions = [];
      if (search) {
        conditions.push(
          sql`(${suppliers.name} LIKE ${`%${search}%`} OR ${suppliers.code} LIKE ${`%${search}%`} OR ${suppliers.document} LIKE ${`%${search}%`})`
        );
      }
      if (status) conditions.push(eq(suppliers.status, status as any));
      if (type) conditions.push(eq(suppliers.type, type as any));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(suppliers)
          .where(where)
          .orderBy(desc(suppliers.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(suppliers)
          .where(where),
      ]);

      return {
        items,
        total: Number(countResult[0]?.count || 0),
      };
    }),

  // Buscar fornecedor por ID
  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, input.id))
        .limit(1);

      if (!supplier) throw new Error("Fornecedor não encontrado");

      const contacts = await db
        .select()
        .from(supplierContacts)
        .where(eq(supplierContacts.supplierId, input.id));

      return { ...supplier, contacts };
    }),

  // Criar fornecedor
  create: publicQuery
    .input(
      z.object({
        code: z.string().min(1).max(50),
        name: z.string().min(1).max(255),
        legalName: z.string().max(255).optional(),
        document: z.string().min(1).max(20),
        documentType: z.enum(["cpf", "cnpj", "rg", "passport"]).default("cnpj"),
        stateRegistration: z.string().max(50).optional(),
        type: z.enum(["factory", "atelier", "distributor", "importer", "raw_material", "logistics"]).default("factory"),
        status: z.enum(["active", "inactive", "blocked", "prospect"]).default("active"),
        isInformal: z.boolean().default(false),
        paymentTermDays: z.number().min(0).default(30),
        minOrderValue: z.string().optional(),
        email: z.string().max(320).optional(),
        phone: z.string().max(50).optional(),
        whatsapp: z.string().max(50).optional(),
        website: z.string().optional(),
        addressStreet: z.string().max(255).optional(),
        addressNumber: z.string().max(20).optional(),
        addressComplement: z.string().max(100).optional(),
        addressNeighborhood: z.string().max(100).optional(),
        addressCity: z.string().max(100).optional(),
        addressState: z.string().max(2).optional(),
        addressZip: z.string().max(20).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(suppliers).values({
        ...input,
        minOrderValue: input.minOrderValue || "0",
      });
      return { id: Number(result.insertId), ...input };
    }),

  // Atualizar fornecedor
  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        code: z.string().min(1).max(50).optional(),
        name: z.string().min(1).max(255).optional(),
        legalName: z.string().max(255).optional(),
        document: z.string().min(1).max(20).optional(),
        documentType: z.enum(["cpf", "cnpj", "rg", "passport"]).optional(),
        stateRegistration: z.string().max(50).optional(),
        type: z.enum(["factory", "atelier", "distributor", "importer", "raw_material", "logistics"]).optional(),
        status: z.enum(["active", "inactive", "blocked", "prospect"]).optional(),
        isInformal: z.boolean().optional(),
        paymentTermDays: z.number().min(0).optional(),
        minOrderValue: z.string().optional(),
        email: z.string().max(320).optional(),
        phone: z.string().max(50).optional(),
        whatsapp: z.string().max(50).optional(),
        website: z.string().optional(),
        addressStreet: z.string().max(255).optional(),
        addressNumber: z.string().max(20).optional(),
        addressComplement: z.string().max(100).optional(),
        addressNeighborhood: z.string().max(100).optional(),
        addressCity: z.string().max(100).optional(),
        addressState: z.string().max(2).optional(),
        addressZip: z.string().max(20).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(suppliers).set(data).where(eq(suppliers.id, id));
      return { id, ...data };
    }),

  // Deletar fornecedor
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(suppliers).where(eq(suppliers.id, input.id));
      return { success: true };
    }),

  // Dashboard stats
  stats: publicQuery.query(async () => {
    const db = getDb();
    const [totalResult, activeResult, informalResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(suppliers),
      db.select({ count: sql<number>`count(*)` }).from(suppliers).where(eq(suppliers.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(suppliers).where(eq(suppliers.isInformal, true)),
    ]);
    return {
      total: Number(totalResult[0]?.count || 0),
      active: Number(activeResult[0]?.count || 0),
      informal: Number(informalResult[0]?.count || 0),
    };
  }),
});
