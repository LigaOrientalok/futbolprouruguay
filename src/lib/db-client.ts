type RequestBody = {
  action: string
  table?: string
  id?: string
  data?: Record<string, unknown>
  sql?: string
  params?: unknown[]
  options?: {
    where?: string
    params?: unknown[]
    orderBy?: string
    limit?: number
    offset?: number
  }
  where?: string
}

async function apiCall<T>(body: RequestBody): Promise<T> {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Error en DB proxy")
  return json.data as T
}

export type QueryResult<T> = T[]

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  return apiCall<T[]>({ action: "query", sql, params })
}

export async function findById<T>(table: string, id: string): Promise<T | null> {
  return apiCall<T | null>({ action: "findById", table, id })
}

export async function findAll<T>(table: string, options?: {
  where?: string
  params?: unknown[]
  orderBy?: string
  limit?: number
  offset?: number
}): Promise<T[]> {
  return apiCall<T[]>({ action: "findAll", table, options })
}

export async function insert<T>(table: string, data: Record<string, unknown>): Promise<T | null> {
  return apiCall<T | null>({ action: "insert", table, data })
}

export async function updateById<T>(table: string, id: string, data: Record<string, unknown>): Promise<T | null> {
  return apiCall<T | null>({ action: "updateById", table, id, data })
}

export async function remove(table: string, id: string): Promise<boolean> {
  return apiCall<boolean>({ action: "remove", table, id })
}

export async function count(table: string, where?: string, params?: unknown[]): Promise<number> {
  return apiCall<number>({ action: "count", table, where, params })
}

export async function queryRaw<T>(sqlText: string, params?: unknown[]): Promise<T[]> {
  return apiCall<T[]>({ action: "queryRaw", sql: sqlText, params })
}
