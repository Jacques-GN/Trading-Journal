// Prisma client with dev-mode cache invalidation workaround.
//
// When the schema is regenerated via `prisma generate`, the Next.js dev
// server may keep the OLD PrismaClient class in its module cache, causing
// queries that reference new fields to fail with "Unknown argument".
// As a workaround, `enrichTradesRaw` uses $queryRawUnsafe to read the
// discipline/calibration columns directly, bypassing the client schema.
import { PrismaClient, Trade } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// ---------------------------------------------------------------------------
// Workaround for the dev-server Prisma cache issue: fetch the new
// discipline/calibration columns via raw SQL so the response includes them
// even when the cached PrismaClient doesn't know about the fields.
// ---------------------------------------------------------------------------

export interface TradeNewFields {
  marketSession: string | null;
  marketBias: string | null;
  timeframe: string | null;
  riskPercent: number | null;
  pnlPercent: number | null;
  setupValid: boolean | null;
  rulesFollowed: boolean | null;
  biggestMistake: string | null;
  improvementNext: string | null;
}

// SQLite stores booleans as 0/1 — coerce to actual booleans for TS consumers.
function coerceRawRow(row: Record<string, unknown>): TradeNewFields {
  return {
    marketSession: (row.marketSession as string | null) ?? null,
    marketBias: (row.marketBias as string | null) ?? null,
    timeframe: (row.timeframe as string | null) ?? null,
    riskPercent: (row.riskPercent as number | null) ?? null,
    pnlPercent: (row.pnlPercent as number | null) ?? null,
    setupValid:
      row.setupValid == null ? null : Number(row.setupValid) === 1,
    rulesFollowed:
      row.rulesFollowed == null ? null : Number(row.rulesFollowed) === 1,
    biggestMistake: (row.biggestMistake as string | null) ?? null,
    improvementNext: (row.improvementNext as string | null) ?? null,
  };
}

const NEW_FIELDS_COLUMNS =
  "id, marketSession, marketBias, timeframe, riskPercent, pnlPercent, setupValid, rulesFollowed, biggestMistake, improvementNext";

/**
 * Merge the new discipline/calibration columns (read via raw SQL) into an
 * array of trades returned by the cached Prisma client.
 */
export async function enrichTradesWithNewFields<T extends Trade>(
  trades: T[]
): Promise<(T & TradeNewFields)[]> {
  if (trades.length === 0) return [];
  const ids = trades.map((t) => `'${t.id.replace(/'/g, "''")}'`).join(",");
  const rows = await db.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT ${NEW_FIELDS_COLUMNS} FROM Trade WHERE id IN (${ids})`
  );
  const map = new Map<string, TradeNewFields>();
  for (const row of rows) {
    map.set(row.id as string, coerceRawRow(row));
  }
  return trades.map((t) => ({
    ...t,
    ...(map.get(t.id) ?? {
      marketSession: null,
      marketBias: null,
      timeframe: null,
      riskPercent: null,
      pnlPercent: null,
      setupValid: null,
      rulesFollowed: null,
      biggestMistake: null,
      improvementNext: null,
    }),
  }));
}

/**
 * Write the new discipline/calibration fields for a single trade using raw
 * SQL (works around the cached PrismaClient not knowing about the columns).
 */
export async function updateTradeNewFields(
  tradeId: string,
  fields: Partial<TradeNewFields>
): Promise<void> {
  const sets: string[] = [];
  const params: unknown[] = [];
  const push = (col: string, value: unknown) => {
    sets.push(`${col} = ?`);
    params.push(value);
  };
  if (fields.marketSession !== undefined)
    push("marketSession", fields.marketSession);
  if (fields.marketBias !== undefined) push("marketBias", fields.marketBias);
  if (fields.timeframe !== undefined) push("timeframe", fields.timeframe);
  if (fields.riskPercent !== undefined) push("riskPercent", fields.riskPercent);
  if (fields.pnlPercent !== undefined) push("pnlPercent", fields.pnlPercent);
  if (fields.setupValid !== undefined)
    push("setupValid", fields.setupValid ? 1 : 0);
  if (fields.rulesFollowed !== undefined)
    push("rulesFollowed", fields.rulesFollowed ? 1 : 0);
  if (fields.biggestMistake !== undefined)
    push("biggestMistake", fields.biggestMistake);
  if (fields.improvementNext !== undefined)
    push("improvementNext", fields.improvementNext);
  if (sets.length === 0) return;
  params.push(tradeId);
  await db.$executeRawUnsafe(
    `UPDATE Trade SET ${sets.join(", ")} WHERE id = ?`,
    ...params
  );
}