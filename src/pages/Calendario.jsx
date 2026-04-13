import { useState, useMemo, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const TIPOS_FERIADO = [
  { id: 'nacional', label: 'Nacional', cor: '#a32d2d', bg: '#fce8e8' },
  { id: 'estadual', label: 'Estadual', cor: '#854f0b', bg: '#faeeda' },
  { id: 'municipal', label: 'Municipal', cor: '#0c447c', bg: '#e6f1fb' },
  { id: 'escolar', label: 'Escolar / Emenda', cor: '#6b4e71', bg: '#ede5f0' },
]

const ESCOPOS_EVENTO = [
  { id: 'escola', label: 'Escola inteira', icon: '🏫' },
  { id: 'integral', label: 'Apenas Integral', icon: '🌿' },
  { id: 'turma', label: 'Turma específica', icon: '🧒' },
]

const FERIADOS_NACIONAIS_PADRAO = [
  { data: '2026-01-01', nome: 'Confraternização Universal' },
  { data: '2026-02-16', nome: 'Carnaval' },
  { data: '2026-02-17', nome: 'Carnaval' },
  { data: '2026-04-03', nome: 'Sexta-feira Santa' },
  { data: '2026-04-21', nome: 'Tiradentes' },
  { data: '2026-05-01', nome: 'Dia do Trabalho' },
  { data: '2026-06-04', nome: 'Corpus Christi' },
  { data: '2026-09-07', nome: 'Independência do Brasil' },
  { data: '2026-10-12', nome: 'Nossa Senhora Aparecida' },
  { data: '2026-11-02', nome: 'Finados' },
  { data: '2026-11-15', nome: 'Proclamação da República' },
  { data: '2026-12-25', nome: 'Natal' },
]

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
function fmtData(d) { return d ? d.split('-').reverse().join('/') : '' }

export default function Calendario() {
  const { showToast } = useApp()
  const [tab, setTab] = useState('feriados')
  const [feriados, setFeriados] = useState(() => lsGet('integral_feriados', []))
  const [eventos, setEventos] = useState(() => lsGet('integral_eventos', []))
  const [mesFiltro, setMesFiltro] = useState(() => new Date().toISOString().slice(0, 7))

  const [formFeriado, setFormFeriado] = useState({ data: '', nome: '', tipo: 'nacional', descricao: '' })
  const [formEvento, setFormEvento] = useState({
    titulo: '', escopo: 'integral', data_inicio: '', data_fim: '', local: '',
    descricao: '', programacao: [],
  })
  const [editandoEvento, setEditandoEvento] = useState(null)
  const [editandoFeriado, setEditandoFeriado] = useState(null)

  useEffect(() => { lsSet('integral_feriados', feriados) }, [feriados])
  useEffect(() => { lsSet('integral_eventos', eventos) }, [eventos])

  function importarNacionais() {
    const existentes = new Set(feriados.map(f => f.data))
    const novos = FERIADOS_NACIONAIS_PADRAO
      .filter(f => !existentes.has(f.data))
      .map(f => ({ id: Date.now().toString() + Math.random().toString(36).slice(2, 6), tipo: 'nacional', descricao: '', ...f }))
    if (novos.length === 0) { showToast('Todos os feriados nacionais já foram importados'); return }
    setFeriados([...feriados, ...novos].sort((a, b) => a.data.localeCompare(b.data)))
    showToast(`${novos.length} feriado(s) nacional(is) importado(s)`)
  }

  function salvarFeriado() {
    if (!formFeriado.data || !formFeriado.nome) return
    if (editandoFeriado) {
      setFeriados(feriados.map(f => f.id === editandoFeriado ? { ...f, ...formFeriado } : f).sort((a, b) => a.data.localeCompare(b.data)))
      showToast('Feriado atualizado')
    } else {
      const novo = { id: Date.now().toString(), ...formFeriado }
      setFeriados([...feriados, novo].sort((a, b) => a.data.localeCompare(b.data)))
      showToast('Feriado adicionado')
    }
    setFormFeriado({ data: '', nome: '', tipo: 'nacional', descricao: '' })
    setEditandoFeriado(null)
  }

  function removerFeriado(id) {
    if (!confirm('Remover este feriado?')) return
    setFeriados(feriados.filter(f => f.id !== id))
    showToast('Feriado removido')
  }

  function iniciarEditFeriado(f) {
    setEditandoFeriado(f.id)
    setFormFeriado({ data: f.data, nome: f.nome, tipo: f.tipo, descricao: f.descricao || '' })
  }

  function addProgItem() {
    setFormEvento(p => ({ ...p, programacao: [...p.programacao, { hora: '', atividade: '', responsavel: '' }] }))
  }
  function updProgItem(idx, patch) {
    setFormEvento(p => ({ ...p, programacao: p.programacao.map((it, i) => i === idx ? { ...it, ...patch } : it) }))
  }
  function rmProgItem(idx) {
    setFormEvento(p => ({ ...p, programacao: p.programacao.filter((_, i) => i !== idx) }))
  }

  function salvarEvento() {
    if (!formEvento.titulo || !formEvento.data_inicio) return
    const fim = formEvento.data_fim || formEvento.data_inicio
    const payload = { ...formEvento, data_fim: fim }
    if (editandoEvento) {
      setEventos(eventos.map(ev => ev.id === editandoEvento ? { ...ev, ...payload } : ev).sort((a, b) => a.data_inicio.localeCompare(b.data_inicio)))
      showToast('Evento atualizado')
    } else {
      const novo = { id: Date.now().toString(), created_at: new Date().toISOString(), ...payload }
      setEventos([...eventos, novo].sort((a, b) => a.data_inicio.localeCompare(b.data_inicio)))
      showToast('Evento cadastrado')
    }
    setFormEvento({ titulo: '', escopo: 'integral', data_inicio: '', data_fim: '', local: '', descricao: '', programacao: [] })
    setEditandoEvento(null)
  }

  function iniciarEditEvento(ev) {
    setEditandoEvento(ev.id)
    setFormEvento({
      titulo: ev.titulo, escopo: ev.escopo, data_inicio: ev.data_inicio,
      data_fim: ev.data_fim || '', local: ev.local || '', descricao: ev.descricao || '',
      programacao: ev.programacao || [],
    })
  }
  function removerEvento(id) {
    if (!confirm('Remover este evento?')) return
    setEventos(eventos.filter(ev => ev.id !== id))
    showToast('Evento removido')
  }

  const feriadosFiltrados = useMemo(() => {
    if (!mesFiltro) return feriados
    return feriados.filter(f => f.data.startsWith(mesFiltro))
  }, [feriados, mesFiltro])

  const eventosFiltrados = useMemo(() => {
    if (!mesFiltro) return eventos
    return eventos.filter(ev => {
      const ini = ev.data_inicio?.slice(0, 7)
      const fim = (ev.data_fim || ev.data_inicio)?.slice(0, 7)
      return ini === mesFiltro || fim === mesFiltro
    })
  }, [eventos, mesFiltro])

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">📆</span> Calendário</div>
          <div className="page-subtitle">Feriados e eventos — aparecem nos alertas e no planejamento</div>
        </div>
      </div>

      <div className="tabs">
        {[['feriados','🎉 Feriados'],['eventos','📅 Eventos']].map(([t, l]) => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Filtrar por mês</label>
          <input type="month" className="form-input" value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} />
        </div>
        <button className="btn btn-ghost btn-xs" onClick={() => setMesFiltro('')}>Ver tudo</button>
      </div>

      {tab === 'feriados' && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">{editandoFeriado ? 'Editar feriado' : 'Adicionar feriado'}</div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Data *</label><input type="date" className="form-input" value={formFeriado.data} onChange={e => setFormFeriado(p => ({ ...p, data: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Nome *</label><input className="form-input" value={formFeriado.nome} onChange={e => setFormFeriado(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Tiradentes" /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TIPOS_FERIADO.map(t => (
                  <button key={t.id} type="button" onClick={() => setFormFeriado(p => ({ ...p, tipo: t.id }))}
                    style={{ padding: '5px 12px', borderRadius: 14, fontSize: 11, cursor: 'pointer', border: `1.5px solid ${formFeriado.tipo === t.id ? t.cor : 'var(--warm3)'}`, background: formFeriado.tipo === t.id ? t.bg : '#fff', color: formFeriado.tipo === t.id ? t.cor : 'var(--ink3)', fontWeight: formFeriado.tipo === t.id ? 600 : 400 }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Descrição (opcional)</label><input className="form-input" value={formFeriado.descricao} onChange={e => setFormFeriado(p => ({ ...p, descricao: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={salvarFeriado}>{editandoFeriado ? '💾 Atualizar' : '+ Adicionar'}</button>
              {editandoFeriado && <button className="btn btn-ghost btn-sm" onClick={() => { setEditandoFeriado(null); setFormFeriado({ data: '', nome: '', tipo: 'nacional', descricao: '' }) }}>Cancelar</button>}
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={importarNacionais}>📥 Importar feriados nacionais 2026</button>
            </div>
          </div>

          {feriadosFiltrados.map(f => {
            const tipo = TIPOS_FERIADO.find(t => t.id === f.tipo)
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid var(--warm3)`, borderLeft: `4px solid ${tipo?.cor || '#888'}`, borderRadius: 'var(--r2)', padding: '12px 16px', marginBottom: 8 }}>
                <div style={{ textAlign: 'center', minWidth: 54 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{f.data.split('-')[2]}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink3)', textTransform: 'uppercase' }}>{new Date(f.data + 'T12:00').toLocaleDateString('pt-BR', { month: 'short' })}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{f.nome}</div>
                  {f.descricao && <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{f.descricao}</div>}
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: tipo?.bg, color: tipo?.cor }}>{tipo?.label}</span>
                <button className="btn btn-ghost btn-xs" onClick={() => iniciarEditFeriado(f)}>✏️</button>
                <button className="btn btn-ghost btn-xs" onClick={() => removerFeriado(f.id)} style={{ color: '#a32d2d' }}>🗑️</button>
              </div>
            )
          })}

          {feriadosFiltrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink4)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 13 }}>Nenhum feriado {mesFiltro ? 'neste mês' : 'cadastrado'}.</div>
              {feriados.length === 0 && <div style={{ fontSize: 12, marginTop: 4 }}>Clique em "Importar feriados nacionais 2026" para começar.</div>}
            </div>
          )}
        </>
      )}

      {tab === 'eventos' && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">{editandoEvento ? 'Editar evento' : 'Cadastrar evento'}</div>
            <div className="form-group"><label className="form-label">Título *</label><input className="form-input" value={formEvento.titulo} onChange={e => setFormEvento(p => ({ ...p, titulo: e.target.value }))} placeholder="Ex: Festa Junina, Passeio ao zoológico..." /></div>

            <div className="form-group">
              <label className="form-label">Escopo</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ESCOPOS_EVENTO.map(s => (
                  <button key={s.id} type="button" onClick={() => setFormEvento(p => ({ ...p, escopo: s.id }))}
                    style={{ padding: '6px 14px', borderRadius: 14, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${formEvento.escopo === s.id ? 'var(--sage)' : 'var(--warm3)'}`, background: formEvento.escopo === s.id ? 'var(--sage-light)' : '#fff', color: formEvento.escopo === s.id ? 'var(--sage-dark)' : 'var(--ink3)', fontWeight: formEvento.escopo === s.id ? 600 : 400 }}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group"><label className="form-label">Data inicial *</label><input type="date" className="form-input" value={formEvento.data_inicio} onChange={e => setFormEvento(p => ({ ...p, data_inicio: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Data final</label><input type="date" className="form-input" value={formEvento.data_fim} onChange={e => setFormEvento(p => ({ ...p, data_fim: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Local</label><input className="form-input" value={formEvento.local} onChange={e => setFormEvento(p => ({ ...p, local: e.target.value }))} placeholder="Ex: Pátio, Quadra..." /></div>
            </div>
            <div className="form-group"><label className="form-label">Descrição</label><textarea className="form-input" style={{ minHeight: 70 }} value={formEvento.descricao} onChange={e => setFormEvento(p => ({ ...p, descricao: e.target.value }))} placeholder="Resumo e objetivo do evento" /></div>

            <div style={{ background: 'var(--warm)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2)' }}>📋 Programação do evento</div>
                <button className="btn btn-ghost btn-xs" onClick={addProgItem}>+ item</button>
              </div>
              {formEvento.programacao.length === 0 && <div style={{ fontSize: 11, color: 'var(--ink4)', fontStyle: 'italic' }}>Adicione itens de programação (hora, atividade, responsável).</div>}
              {formEvento.programacao.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <input type="time" className="form-input" style={{ width: 100 }} value={it.hora} onChange={e => updProgItem(i, { hora: e.target.value })} />
                  <input className="form-input" style={{ flex: 2 }} value={it.atividade} onChange={e => updProgItem(i, { atividade: e.target.value })} placeholder="Atividade" />
                  <input className="form-input" style={{ flex: 1 }} value={it.responsavel} onChange={e => updProgItem(i, { responsavel: e.target.value })} placeholder="Responsável" />
                  <button className="btn btn-ghost btn-xs" onClick={() => rmProgItem(i)}>×</button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={salvarEvento}>{editandoEvento ? '💾 Atualizar' : '+ Cadastrar'}</button>
              {editandoEvento && <button className="btn btn-ghost btn-sm" onClick={() => { setEditandoEvento(null); setFormEvento({ titulo: '', escopo: 'integral', data_inicio: '', data_fim: '', local: '', descricao: '', programacao: [] }) }}>Cancelar</button>}
            </div>
          </div>

          {eventosFiltrados.map(ev => {
            const escopo = ESCOPOS_EVENTO.find(s => s.id === ev.escopo)
            const mesmaData = !ev.data_fim || ev.data_fim === ev.data_inicio
            return (
              <div key={ev.id} style={{ background: '#fff', border: '1px solid var(--warm3)', borderLeft: '4px solid var(--sage)', borderRadius: 'var(--r)', padding: '14px 18px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{ev.titulo}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--sage-light)', color: 'var(--sage-dark)', fontWeight: 600 }}>{escopo?.icon} {escopo?.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
                      📅 {fmtData(ev.data_inicio)}{!mesmaData && ` a ${fmtData(ev.data_fim)}`}
                      {ev.local && ` · 📍 ${ev.local}`}
                    </div>
                    {ev.descricao && <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 6, lineHeight: 1.5 }}>{ev.descricao}</div>}
                    {ev.programacao?.length > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--warm3)' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', marginBottom: 4 }}>Programação</div>
                        {ev.programacao.map((it, i) => (
                          <div key={i} style={{ fontSize: 12, color: 'var(--ink2)', padding: '2px 0' }}>
                            <strong>{it.hora || '—'}</strong> · {it.atividade}{it.responsavel && <span style={{ color: 'var(--ink4)' }}> · {it.responsavel}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-xs" onClick={() => iniciarEditEvento(ev)}>✏️</button>
                    <button className="btn btn-ghost btn-xs" onClick={() => removerEvento(ev.id)} style={{ color: '#a32d2d' }}>🗑️</button>
                  </div>
                </div>
              </div>
            )
          })}

          {eventosFiltrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink4)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📅</div>
              <div style={{ fontSize: 13 }}>Nenhum evento {mesFiltro ? 'neste mês' : 'cadastrado'}.</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
