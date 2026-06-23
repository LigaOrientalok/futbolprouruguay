import { Pool } from "@neondatabase/serverless"

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  }
  return pool
}

export type QueryResult<T> = T[]

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const client = getPool()
  const result = await client.query(sql, params)
  return result.rows as T[]
}

// Helpers específicos para tablas comunes
export async function findById<T>(table: string, id: string): Promise<T | null> {
  const rows = await query<T>(`SELECT * FROM ${table} WHERE id = $1`, [id])
  return rows[0] || null
}

export async function findAll<T>(table: string, options?: {
  where?: string
  params?: unknown[]
  orderBy?: string
  limit?: number
  offset?: number
}): Promise<T[]> {
  let sqlText = `SELECT * FROM ${table}`
  const allParams: unknown[] = []
  
  if (options?.where) {
    sqlText += ` WHERE ${options.where}`
    if (options?.params) allParams.push(...options.params)
  }
  if (options?.orderBy) sqlText += ` ORDER BY ${options.orderBy}`
  if (options?.limit) sqlText += ` LIMIT ${options.limit}`
  if (options?.offset) sqlText += ` OFFSET ${options.offset}`
  
  return await query<T>(sqlText, allParams.length > 0 ? allParams : undefined)
}

export async function insert<T>(table: string, data: Record<string, unknown>): Promise<T | null> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")
  const columns = keys.join(", ")
  
  const rows = await query<T>(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  )
  return rows[0] || null
}

export async function updateById<T>(table: string, id: string, data: Record<string, unknown>): Promise<T | null> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")
  
  const rows = await query<T>(
    `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  )
  return rows[0] || null
}

export async function remove(table: string, id: string): Promise<boolean> {
  const result = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [id])
  return result.length > 0
}

export async function count(table: string, where?: string, params?: unknown[]): Promise<number> {
  let sqlText = `SELECT COUNT(*) as count FROM ${table}`
  if (where) {
    sqlText += ` WHERE ${where}`
  }
  const rows = await query<{ count: number }>(sqlText, params)
  return Number(rows[0]?.count) || 0
}

// Para joins y queries más complejas
export async function queryRaw<T>(sqlText: string, params?: unknown[]): Promise<T[]> {
  return await query<T>(sqlText, params)
}
