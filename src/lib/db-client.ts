type RequestBody = {
  action: string
  table?: string
  id?: string
  data?: Record<string, any>
  sql?: string
  params?: any[]
  options?: {
    where?: string
    params?: any[]
    orderBy?: string
    limit?: number
    offset?: number
  }
  where?: string
}

async function apiCall<T = any>(body: RequestBody): Promise<T> {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Error en DB proxy")
  return json.data as T
}

export type QueryResult<T = any> = T[]

export async function query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
  return apiCall<T[]>({ action: "query", sql, params })
}

export async function findById<T = any>(table: string, id: string): Promise<T | null> {
  return apiCall<T | null>({ action: "findById", table, id })
}

export async function findAll<T = any>(table: string, options?: {
  where?: string
  params?: any[]
  orderBy?: string
  limit?: number
  offset?: number
}): Promise<T[]> {
  return apiCall<T[]>({ action: "findAll", table, options })
}

export async function insert<T = any>(table: string, data: Record<string, any>): Promise<T | null> {
  return apiCall<T | null>({ action: "insert", table, data })
}

export async function updateById<T = any>(table: string, id: string, data: Record<string, any>): Promise<T | null> {
  return apiCall<T | null>({ action: "updateById", table, id, data })
}

export async function remove(table: string, id: string): Promise<boolean> {
  return apiCall<boolean>({ action: "remove", table, id })
}

export async function count(table: string, where?: string, params?: any[]): Promise<number> {
  return apiCall<number>({ action: "count", table, where, params })
}

export async function queryRaw<T = any>(sqlText: string, params?: any[]): Promise<T[]> {
  return apiCall<T[]>({ action: "queryRaw", sql: sqlText, params })
}
