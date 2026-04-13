import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || ''

export const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null
export const isConfigured = !!(SUPABASE_URL && SUPABASE_KEY)

export async function dbSelect(table, query = {}) {
  if (!supabase) return { data: null, error: 'não configurado' }
  let q = supabase.from(table).select(query.select || '*')
  if (query.eq) Object.entries(query.eq).forEach(([k, v]) => { q = q.eq(k, v) })
  if (query.order) q = q.order(query.order, { ascending: query.asc ?? false })
  if (query.limit) q = q.limit(query.limit)
  return q
}
export async function dbInsert(table, data) {
  if (!supabase) return { data: null, error: 'não configurado' }
  return supabase.from(table).insert(data).select().single()
}
export async function dbUpdate(table, id, data) {
  if (!supabase) return { data: null, error: 'não configurado' }
  return supabase.from(table).update(data).eq('id', id).select().single()
}
export async function dbDelete(table, id) {
  if (!supabase) return { data: null, error: 'não configurado' }
  return supabase.from(table).delete().eq('id', id)
}
export async function dbUpsert(table, data, onConflict = 'id') {
  if (!supabase) return { data: null, error: 'não configurado' }
  return supabase.from(table).upsert(data, { onConflict }).select().single()
}
export async function uploadFoto(file, path) {
  if (!supabase) return { url: null, error: 'não configurado' }
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const fullPath = `${path}/${fileName}`
  const { error } = await supabase.storage.from('fotos').upload(fullPath, file)
  if (error) return { url: null, error }
  const { data } = supabase.storage.from('fotos').getPublicUrl(fullPath)
  return { url: data.publicUrl, error: null }
}

// SQL SCHEMA — veja o arquivo /SQL_SCHEMA.sql incluído no projeto
