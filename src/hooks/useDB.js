// Hook unificado: Supabase quando configurado, localStorage como fallback
// As educadoras não precisam mudar nada — o sistema detecta automaticamente

import { useState, useEffect, useCallback } from 'react'
import { supabase, isConfigured, dbSelect, dbInsert, dbUpdate, dbDelete, dbUpsert } from '../lib/supabase.js'

// ─── localStorage helpers ────────────────────────────────────
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ─── Hook principal ──────────────────────────────────────────
export function useDB() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConfigured && supabase) {
      supabase.from('educadoras').select('id').limit(1)
        .then(({ error }) => {
          setConnected(!error)
          setLoading(false)
        })
    } else {
      setConnected(false)
      setLoading(false)
    }
  }, [])

  return { connected, loading, mode: connected ? 'supabase' : 'local' }
}

// ─── Educadoras ──────────────────────────────────────────────
export function useEducadoras() {
  const [data, setData] = useState(() => lsGet('integral_educadoras', []))
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!isConfigured) return
    setLoading(true)
    const { data: rows } = await dbSelect('educadoras', { order: 'nome', asc: true })
    if (rows) { setData(rows); lsSet('integral_educadoras', rows) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function add(item) {
    if (isConfigured) {
      const { data: row } = await dbInsert('educadoras', item)
      if (row) { setData(p => [...p, row]); lsSet('integral_educadoras', [...data, row]) }
    } else {
      const novo = { ...item, id: Date.now().toString() }
      setData(p => { const n = [...p, novo]; lsSet('integral_educadoras', n); return n })
    }
  }

  async function update(id, item) {
    if (isConfigured) {
      const { data: row } = await dbUpdate('educadoras', id, item)
      if (row) setData(p => { const n = p.map(e => e.id === id ? row : e); lsSet('integral_educadoras', n); return n })
    } else {
      setData(p => { const n = p.map(e => e.id === id ? { ...e, ...item } : e); lsSet('integral_educadoras', n); return n })
    }
  }

  async function remove(id) {
    if (isConfigured) await dbDelete('educadoras', id)
    setData(p => { const n = p.filter(e => e.id !== id); lsSet('integral_educadoras', n); return n })
  }

  return { data, loading, add, update, remove, reload: load }
}

// ─── Crianças ─────────────────────────────────────────────────
export function useCriancas() {
  const [data, setData] = useState(() => lsGet('integral_criancas', []))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConfigured) return
    setLoading(true)
    dbSelect('criancas', { order: 'nome', asc: true }).then(({ data: rows }) => {
      if (rows) { setData(rows); lsSet('integral_criancas', rows) }
      setLoading(false)
    })
  }, [])

  async function add(item) {
    if (isConfigured) {
      const { data: row } = await dbInsert('criancas', item)
      if (row) setData(p => { const n = [...p, row]; lsSet('integral_criancas', n); return n })
    } else {
      const novo = { ...item, id: Date.now().toString(), obs: [] }
      setData(p => { const n = [...p, novo]; lsSet('integral_criancas', n); return n })
    }
  }

  async function update(id, item) {
    if (isConfigured) {
      const { data: row } = await dbUpdate('criancas', id, item)
      if (row) setData(p => { const n = p.map(c => c.id === id ? { ...c, ...row } : c); lsSet('integral_criancas', n); return n })
    } else {
      setData(p => { const n = p.map(c => c.id === id ? { ...c, ...item } : c); lsSet('integral_criancas', n); return n })
    }
  }

  async function addObs(criancaId, obs) {
    if (isConfigured) {
      await dbInsert('observacoes_criancas', { crianca_id: criancaId, ...obs })
    }
    // Também salva local para exibição imediata
    setData(p => {
      const n = p.map(c => c.id === criancaId
        ? { ...c, obs: [...(c.obs || []), { id: Date.now().toString(), ...obs }] }
        : c)
      lsSet('integral_criancas', n)
      return n
    })
  }

  return { data, loading, add, update, addObs }
}

// ─── Banco de Atividades ─────────────────────────────────────
export function useAtividades() {
  const [data, setData] = useState(() => lsGet('integral_atividades', []))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConfigured) return
    setLoading(true)
    dbSelect('atividades', { order: 'created_at', asc: false }).then(({ data: rows }) => {
      if (rows?.length) { setData(rows); lsSet('integral_atividades', rows) }
      setLoading(false)
    })
  }, [])

  async function save(item) {
    const payload = {
      titulo: item.titulo,
      tipo: item.tipo,
      descricao: item.descricao,
      espaco: item.espaco,
      materiais: item.materiais,
      faixa_etaria: item.faixaEtaria || item.faixa_etaria,
      campos_experiencia: item.camposExperiencia || item.campos_experiencia,
      objetivos: item.objetivos,
      duracao: item.duracao,
      tags: typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim()) : item.tags,
      projeto: item.projeto,
      mes: item.mes,
      ativa: true,
    }

    if (isConfigured) {
      if (item.id && typeof item.id === 'string' && item.id.includes('-')) {
        const { data: row } = await dbUpdate('atividades', item.id, payload)
        if (row) setData(p => { const n = p.map(a => a.id === item.id ? row : a); lsSet('integral_atividades', n); return n })
      } else {
        const { data: row } = await dbInsert('atividades', payload)
        if (row) setData(p => { const n = [...p, row]; lsSet('integral_atividades', n); return n })
      }
    } else {
      const novaAtiv = { ...payload, id: item.id || Date.now() }
      setData(p => {
        const exists = p.find(a => a.id === novaAtiv.id)
        const n = exists ? p.map(a => a.id === novaAtiv.id ? novaAtiv : a) : [...p, novaAtiv]
        lsSet('integral_atividades', n)
        return n
      })
    }
  }

  async function remove(id) {
    if (isConfigured) await dbDelete('atividades', id)
    setData(p => { const n = p.filter(a => a.id !== id); lsSet('integral_atividades', n); return n })
  }

  return { data, loading, save, remove }
}

// ─── Planejamentos Semanais ───────────────────────────────────
export function usePlanejamentos() {
  const [data, setData] = useState(() => lsGet('integral_planejamentos', []))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConfigured) return
    setLoading(true)
    dbSelect('planejamentos', { order: 'semana', asc: false }).then(({ data: rows }) => {
      if (rows?.length) { setData(rows); lsSet('integral_planejamentos', rows) }
      setLoading(false)
    })
  }, [])

  async function save(plano) {
    const payload = {
      semana: plano.semana,
      educadoras_ref: plano.ref || plano.educadoras_ref,
      educadoras_apoio: plano.apoio || plano.educadoras_apoio,
      slots: plano.slots,
      propostas: plano.propostas,
      observacao: plano.observacao,
      revisao: plano.revisao,
      ajustes: plano.ajustes,
      reflexao: plano.reflexao,
      updated_at: new Date().toISOString(),
    }

    if (isConfigured) {
      const { data: row } = await dbUpsert('planejamentos', payload, 'semana')
      if (row) setData(p => {
        const exists = p.find(pl => pl.semana === row.semana)
        const n = exists ? p.map(pl => pl.semana === row.semana ? row : pl) : [...p, row]
        lsSet('integral_planejamentos', n)
        return n
      })
    } else {
      setData(p => {
        const exists = p.find(pl => pl.semana === plano.semana)
        const novo = { ...payload, id: plano.id || Date.now() }
        const n = exists ? p.map(pl => pl.semana === plano.semana ? novo : pl) : [...p, novo]
        lsSet('integral_planejamentos', n)
        return n
      })
    }
  }

  return { data, loading, save }
}

// ─── Registros Pedagógicos ────────────────────────────────────
export function useRegistros() {
  const [data, setData] = useState(() => lsGet('integral_registros', []))

  useEffect(() => {
    if (!isConfigured) return
    dbSelect('registros', { order: 'data', asc: false }).then(({ data: rows }) => {
      if (rows?.length) { setData(rows); lsSet('integral_registros', rows) }
    })
  }, [])

  async function add(item) {
    if (isConfigured) {
      const { data: row } = await dbInsert('registros', item)
      if (row) setData(p => { const n = [row, ...p]; lsSet('integral_registros', n); return n })
    } else {
      const novo = { ...item, id: Date.now().toString() }
      setData(p => { const n = [novo, ...p]; lsSet('integral_registros', n); return n })
    }
  }

  return { data, add }
}

// ─── Diário Fotográfico ───────────────────────────────────────
export function useDiario() {
  const [data, setData] = useState(() => lsGet('integral_diario', []))

  useEffect(() => {
    if (!isConfigured) return
    dbSelect('diario', { order: 'data', asc: false }).then(({ data: rows }) => {
      if (rows?.length) { setData(rows); lsSet('integral_diario', rows) }
    })
  }, [])

  async function saveEntry(entry) {
    const payload = { data: entry.data, resumo: entry.resumo, updated_at: new Date().toISOString() }
    if (isConfigured) {
      const { data: row } = await dbUpsert('diario', payload, 'data')
      if (row) setData(p => {
        const exists = p.find(d => d.data === row.data)
        const n = exists ? p.map(d => d.data === row.data ? row : d) : [row, ...p]
        lsSet('integral_diario', n)
        return n
      })
    } else {
      setData(p => {
        const exists = p.find(d => d.data === entry.data)
        const novo = { ...payload, id: Date.now().toString() }
        const n = exists ? p.map(d => d.data === entry.data ? novo : d) : [novo, ...p]
        lsSet('integral_diario', n)
        return n
      })
    }
  }

  return { data, saveEntry }
}

// ─── Jornais Literários ───────────────────────────────────────
export function useJornais() {
  const [data, setData] = useState(() => lsGet('integral_jornais', []))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConfigured) return
    setLoading(true)
    dbSelect('jornais', { order: 'ano', asc: false }).then(({ data: rows }) => {
      if (rows?.length) { setData(rows); lsSet('integral_jornais', rows) }
      setLoading(false)
    })
  }, [])

  async function save(jornal) {
    const payload = {
      titulo: jornal.titulo,
      mes: jornal.mes,
      ano: jornal.ano,
      turma: jornal.turma,
      num_criancas: jornal.numCriancas,
      atividades: jornal.atividades,
      publicado: jornal.publicado || false,
      updated_at: new Date().toISOString(),
    }

    if (isConfigured) {
      const { data: row } = await dbUpsert('jornais', payload, 'mes,ano')
      if (row) setData(p => {
        const exists = p.find(j => j.mes === row.mes && j.ano === row.ano)
        const n = exists ? p.map(j => (j.mes === row.mes && j.ano === row.ano) ? row : j) : [...p, row]
        lsSet('integral_jornais', n)
        return n
      })
    } else {
      setData(p => {
        const exists = p.find(j => j.mes === jornal.mes && j.ano === jornal.ano)
        const novo = { ...payload, id: jornal.id || Date.now().toString() }
        const n = exists ? p.map(j => (j.mes === jornal.mes && j.ano === jornal.ano) ? novo : j) : [...p, novo]
        lsSet('integral_jornais', n)
        return n
      })
    }
  }

  return { data, loading, save }
}

// ─── Ponto Diário ─────────────────────────────────────────────
export function usePonto(educadoraId) {
  const [data, setData] = useState({})

  useEffect(() => {
    if (!isConfigured || !educadoraId) return
    dbSelect('ponto_diario', { eq: { educadora_id: educadoraId } }).then(({ data: rows }) => {
      if (rows) {
        const map = {}
        rows.forEach(r => { map[r.data] = r })
        setData(map)
      }
    })
  }, [educadoraId])

  async function marcar(data_str, status, motivo = '', obs = '') {
    const payload = { educadora_id: educadoraId, data: data_str, status, motivo, obs }
    if (isConfigured) {
      await dbUpsert('ponto_diario', payload, 'educadora_id,data')
    }
    setData(p => ({ ...p, [data_str]: payload }))
  }

  return { data, marcar }
}
