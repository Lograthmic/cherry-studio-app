import { and, asc, desc, eq, gt, lt, ne, type SQL } from 'drizzle-orm';
import type { AnySQLiteColumn, SQLiteTable } from 'drizzle-orm/sqlite-core';
import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing';

import { DataApiErrorFactory } from '@/data/types/apiTypes';
import type { OrderRequest } from '@/data/types/topic';

type TxLike = any;

interface TableWithOrderKey extends SQLiteTable {
  orderKey: AnySQLiteColumn;
}

export function generateOrderKeySequence(count: number): string[] {
  if (count <= 0) {
    return [];
  }

  return generateNKeysBetween(null, null, count);
}

export function generateOrderKeyBetween(before: string | null, after: string | null): string {
  return generateKeyBetween(before, after);
}

export function generateOrderKeySequenceBetween(
  before: string | null,
  after: string | null,
  count: number,
): string[] {
  if (count <= 0) {
    return [];
  }

  return generateNKeysBetween(before, after, count);
}

export async function insertWithOrderKey<
  TTable extends TableWithOrderKey,
  TValues extends Record<string, unknown>,
>(
  tx: TxLike,
  table: TTable,
  values: TValues,
  options: { position?: 'first' | 'last'; scope?: SQL },
): Promise<Record<string, unknown>> {
  const position = options.position ?? 'last';
  const boundary =
    position === 'last'
      ? await selectBoundaryKey(tx, table, 'last', options.scope)
      : await selectBoundaryKey(tx, table, 'first', options.scope);
  const orderKey =
    position === 'last'
      ? generateOrderKeyBetween(boundary, null)
      : generateOrderKeyBetween(null, boundary);
  const [row] = await tx
    .insert(table)
    .values({ ...values, orderKey })
    .returning();

  if (!row) {
    throw new Error('insertWithOrderKey: insert returned no rows');
  }

  return row as Record<string, unknown>;
}

export async function insertManyWithOrderKey<
  TTable extends TableWithOrderKey,
  TValues extends Record<string, unknown>,
>(
  tx: TxLike,
  table: TTable,
  values: TValues[],
  options: { position?: 'first' | 'last'; scope?: SQL },
): Promise<Record<string, unknown>[]> {
  if (values.length === 0) {
    return [];
  }

  const position = options.position ?? 'last';
  const boundary =
    position === 'last'
      ? await selectBoundaryKey(tx, table, 'last', options.scope)
      : await selectBoundaryKey(tx, table, 'first', options.scope);
  const orderKeys =
    position === 'last'
      ? generateOrderKeySequenceBetween(boundary, null, values.length)
      : generateOrderKeySequenceBetween(null, boundary, values.length);
  const rows = await tx
    .insert(table)
    .values(values.map((value, index) => ({ ...value, orderKey: orderKeys[index] })))
    .returning();

  return rows as Record<string, unknown>[];
}

export async function applyMoves(
  tx: TxLike,
  table: TableWithOrderKey,
  moves: { anchor: OrderRequest; id: string }[],
  options: { pkColumn: AnySQLiteColumn; resourceName: string; scope?: SQL },
): Promise<void> {
  const byId = new Map(moves.map((move) => [move.id, move]));

  for (const move of byId.values()) {
    assertAnchorNotSelf(move.id, move.anchor);

    const current = await selectRowByPk(tx, table, options.pkColumn, move.id, options.scope);
    if (!current) {
      throw DataApiErrorFactory.notFound(options.resourceName, move.id);
    }

    const newKey = await computeNewOrderKey(tx, table, move.anchor, {
      excludePkValue: move.id,
      pkColumn: options.pkColumn,
      resourceName: options.resourceName,
      scope: options.scope,
    });

    if (newKey === current.orderKey) {
      continue;
    }

    await tx
      .update(table)
      .set({ orderKey: newKey })
      .where(
        options.scope
          ? and(eq(options.pkColumn, move.id), options.scope)
          : eq(options.pkColumn, move.id),
      );
  }
}

async function computeNewOrderKey(
  tx: TxLike,
  table: TableWithOrderKey,
  request: OrderRequest,
  options: {
    excludePkValue?: string;
    pkColumn: AnySQLiteColumn;
    resourceName: string;
    scope?: SQL;
  },
): Promise<string> {
  const exclusion =
    options.excludePkValue !== undefined
      ? buildExclusion(options.pkColumn, options.excludePkValue, options.scope)
      : options.scope;

  if ('position' in request) {
    if (request.position === 'first') {
      const smallest = await selectBoundaryKey(tx, table, 'first', exclusion);
      return generateOrderKeyBetween(null, smallest);
    }

    const largest = await selectBoundaryKey(tx, table, 'last', exclusion);
    return generateOrderKeyBetween(largest, null);
  }

  if ('before' in request) {
    const anchorKey = await requireOrderKey(
      tx,
      table,
      options.pkColumn,
      request.before,
      options.scope,
      options.resourceName,
    );
    const predecessor = await selectAdjacentKey(tx, table, 'predecessor', anchorKey, exclusion);
    return generateOrderKeyBetween(predecessor, anchorKey);
  }

  const anchorKey = await requireOrderKey(
    tx,
    table,
    options.pkColumn,
    request.after,
    options.scope,
    options.resourceName,
  );
  const successor = await selectAdjacentKey(tx, table, 'successor', anchorKey, exclusion);
  return generateOrderKeyBetween(anchorKey, successor);
}

async function selectBoundaryKey(
  tx: TxLike,
  table: TableWithOrderKey,
  which: 'first' | 'last',
  scope?: SQL,
): Promise<string | null> {
  const orderExpression = which === 'first' ? asc(table.orderKey) : desc(table.orderKey);
  const rows = await tx
    .select({ orderKey: table.orderKey })
    .from(table)
    .where(scope ?? undefined)
    .orderBy(orderExpression)
    .limit(1);
  const first = rows[0] as { orderKey: string | null } | undefined;
  return first?.orderKey ?? null;
}

async function selectAdjacentKey(
  tx: TxLike,
  table: TableWithOrderKey,
  side: 'predecessor' | 'successor',
  anchorKey: string,
  scope?: SQL,
): Promise<string | null> {
  const predicate =
    side === 'predecessor' ? lt(table.orderKey, anchorKey) : gt(table.orderKey, anchorKey);
  const where = scope ? and(predicate, scope) : predicate;
  const orderExpression = side === 'predecessor' ? desc(table.orderKey) : asc(table.orderKey);
  const rows = await tx
    .select({ orderKey: table.orderKey })
    .from(table)
    .where(where)
    .orderBy(orderExpression)
    .limit(1);
  const first = rows[0] as { orderKey: string | null } | undefined;
  return first?.orderKey ?? null;
}

async function requireOrderKey(
  tx: TxLike,
  table: TableWithOrderKey,
  pkColumn: AnySQLiteColumn,
  id: string,
  scope: SQL | undefined,
  resourceName: string,
): Promise<string> {
  const row = await selectRowByPk(tx, table, pkColumn, id, scope);
  if (!row) {
    throw DataApiErrorFactory.notFound(resourceName, id);
  }

  return row.orderKey;
}

async function selectRowByPk(
  tx: TxLike,
  table: TableWithOrderKey,
  pkColumn: AnySQLiteColumn,
  id: string,
  scope?: SQL,
): Promise<{ orderKey: string } | null> {
  const where = scope ? and(eq(pkColumn, id), scope) : eq(pkColumn, id);
  const rows = await tx.select({ orderKey: table.orderKey }).from(table).where(where).limit(1);
  return (rows[0] as { orderKey: string } | undefined) ?? null;
}

function buildExclusion(pkColumn: AnySQLiteColumn, excludePkValue: string, scope?: SQL): SQL {
  const notSelf = ne(pkColumn, excludePkValue);
  if (!scope) {
    return notSelf;
  }

  return and(notSelf, scope) as SQL;
}

function assertAnchorNotSelf(moveId: string, anchor: OrderRequest) {
  if ('before' in anchor && anchor.before === moveId) {
    throw DataApiErrorFactory.validation(
      { anchor: ['anchor "before" id must not equal the move id'] },
      `applyMoves: anchor "before" id "${moveId}" cannot equal the move's own id`,
    );
  }

  if ('after' in anchor && anchor.after === moveId) {
    throw DataApiErrorFactory.validation(
      { anchor: ['anchor "after" id must not equal the move id'] },
      `applyMoves: anchor "after" id "${moveId}" cannot equal the move's own id`,
    );
  }
}
