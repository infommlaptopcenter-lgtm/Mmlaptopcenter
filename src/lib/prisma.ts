import { PrismaClient } from "@prisma/client";
import { createMockStore, MockStore } from "./mock-store";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  mockStore?: MockStore;
};

if (!globalForPrisma.mockStore) {
  globalForPrisma.mockStore = createMockStore();
}

const mockStore = globalForPrisma.mockStore;

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }
    return url.toString();
  } catch {
    return value;
  }
}

function matchesWhere(item: any, where: any): boolean {
  if (!where || typeof where !== "object") return true;

  for (const [key, value] of Object.entries(where)) {
    if (key === "OR" && Array.isArray(value)) {
      if (!value.some((condition) => matchesWhere(item, condition))) {
        return false;
      }
      continue;
    }

    if (key === "AND" && Array.isArray(value)) {
      if (!value.every((condition) => matchesWhere(item, condition))) {
        return false;
      }
      continue;
    }

    if (key === "NOT") {
      if (typeof value === "object" && !Array.isArray(value)) {
        if (matchesWhere(item, value)) return false;
      }
      continue;
    }

    const itemVal = item[key];

    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const v = value as Record<string, any>;
      if ("equals" in v && itemVal !== v.equals) return false;
      if ("not" in v && itemVal === v.not) return false;
      if ("in" in v && Array.isArray(v.in) && !v.in.includes(itemVal)) return false;
      if ("notIn" in v && Array.isArray(v.notIn) && v.notIn.includes(itemVal)) return false;
      if ("contains" in v && typeof itemVal === "string") {
        const query = String(v.contains).toLowerCase();
        if (!itemVal.toLowerCase().includes(query)) return false;
      }
      if ("gt" in v && !(itemVal > v.gt)) return false;
      if ("gte" in v && !(itemVal >= v.gte)) return false;
      if ("lt" in v && !(itemVal < v.lt)) return false;
      if ("lte" in v && !(itemVal <= v.lte)) return false;
      continue;
    }

    if (itemVal !== value) {
      return false;
    }
  }

  return true;
}

function applySelect(item: any, select: any): any {
  if (!item) return item;
  if (!select || typeof select !== "object") return item;

  const result: any = {};
  for (const key of Object.keys(select)) {
    if (select[key]) {
      result[key] = item[key] ?? null;
    }
  }
  return result;
}

function createModelMock(modelName: string) {
  const getTable = (): any[] => {
    const list = (mockStore as any)[modelName];
    if (!list) {
      (mockStore as any)[modelName] = [];
    }
    return (mockStore as any)[modelName];
  };

  return {
    findMany: async (args?: any) => {
      let items = [...getTable()];
      if (args?.where) {
        items = items.filter((item) => matchesWhere(item, args.where));
      }

      if (args?.orderBy) {
        const orderBys = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
        items.sort((a, b) => {
          for (const order of orderBys) {
            const [k, dir] = Object.entries(order)[0] || [];
            if (!k) continue;
            const valA = a[k];
            const valB = b[k];
            if (valA === valB) continue;
            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;
            const compare = valA > valB ? 1 : -1;
            return dir === "desc" ? -compare : compare;
          }
          return 0;
        });
      }

      if (args?.skip) {
        items = items.slice(args.skip);
      }
      if (args?.take) {
        items = items.slice(0, args.take);
      }

      if (args?.select) {
        return items.map((item) => applySelect(item, args.select));
      }

      return items;
    },

    findUnique: async (args: any) => {
      const items = getTable();
      const found = items.find((item) => matchesWhere(item, args.where));
      if (!found) return null;
      if (args?.select) return applySelect(found, args.select);
      return found;
    },

    findFirst: async (args?: any) => {
      let items = [...getTable()];
      if (args?.where) {
        items = items.filter((item) => matchesWhere(item, args.where));
      }
      const found = items[0] ?? null;
      if (!found) return null;
      if (args?.select) return applySelect(found, args.select);
      return found;
    },

    count: async (args?: any) => {
      let items = getTable();
      if (args?.where) {
        items = items.filter((item) => matchesWhere(item, args.where));
      }
      return items.length;
    },

    create: async (args: any) => {
      const data = {
        id: args?.data?.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args?.data,
      };
      getTable().push(data);
      if (args?.select) return applySelect(data, args.select);
      return data;
    },

    update: async (args: any) => {
      const items = getTable();
      const index = items.findIndex((item) => matchesWhere(item, args.where));
      if (index === -1) {
        throw new Error(`Record to update not found in ${modelName}`);
      }
      const updated = {
        ...items[index],
        ...args.data,
        updatedAt: new Date(),
      };
      items[index] = updated;
      if (args?.select) return applySelect(updated, args.select);
      return updated;
    },

    upsert: async (args: any) => {
      const items = getTable();
      const index = items.findIndex((item) => matchesWhere(item, args.where));
      if (index !== -1) {
        const updated = {
          ...items[index],
          ...args.update,
          updatedAt: new Date(),
        };
        items[index] = updated;
        return updated;
      }
      const created = {
        id: args?.create?.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.create,
      };
      items.push(created);
      return created;
    },

    delete: async (args: any) => {
      const items = getTable();
      const index = items.findIndex((item) => matchesWhere(item, args.where));
      if (index !== -1) {
        const deleted = items.splice(index, 1)[0];
        return deleted;
      }
      return {};
    },

    deleteMany: async (args?: any) => {
      const table = (mockStore as any)[modelName] || [];
      if (!args?.where) {
        const count = table.length;
        (mockStore as any)[modelName] = [];
        return { count };
      }
      const remaining = table.filter((item: any) => !matchesWhere(item, args.where));
      const deletedCount = table.length - remaining.length;
      (mockStore as any)[modelName] = remaining;
      return { count: deletedCount };
    },

    groupBy: async () => [],
  };
}

let rawPrisma: PrismaClient | null = null;
const dbUrl = getDatabaseUrl();
if (dbUrl) {
  try {
    rawPrisma = new PrismaClient({
      datasources: { db: { url: dbUrl } },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (err) {
    console.warn("[AI Studio] Failed to initialize PrismaClient, using in-memory mock fallback:", err);
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop: string | symbol) => {
    if (prop === "$disconnect" || prop === "$connect") {
      return async () => {};
    }

    if (prop === "$transaction") {
      return async (arg: any) => {
        if (rawPrisma && typeof rawPrisma.$transaction === "function") {
          try {
            return await rawPrisma.$transaction(arg);
          } catch (dbErr) {
            console.warn("[AI Studio] Real DB $transaction failed, executing with fallback:", (dbErr as Error)?.message);
          }
        }
        if (Array.isArray(arg)) {
          const results = [];
          for (const action of arg) {
            results.push(await action);
          }
          return results;
        }
        if (typeof arg === "function") {
          return await arg(prisma);
        }
        return arg;
      };
    }

    const modelName = typeof prop === "string" ? prop : String(prop);
    const mockModel = createModelMock(modelName);

    if (!rawPrisma || !(modelName in rawPrisma)) {
      return mockModel;
    }

    const realModel = (rawPrisma as any)[modelName];
    return new Proxy(realModel, {
      get: (target, method: string) => {
        const realMethod = target[method];
        if (typeof realMethod !== "function") {
          return (mockModel as any)[method];
        }

        return async (...args: any[]) => {
          try {
            return await realMethod.apply(target, args);
          } catch (dbErr) {
            console.warn(`[AI Studio] Real DB query on '${modelName}.${method}' failed, falling back to mock:`, (dbErr as Error)?.message);
            const fallbackMethod = (mockModel as any)[method];
            if (typeof fallbackMethod === "function") {
              return await fallbackMethod(...args);
            }
            throw dbErr;
          }
        };
      },
    });
  },
});

globalForPrisma.prisma = prisma;
