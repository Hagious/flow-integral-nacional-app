import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const TIPOS = [
  { id: 'elogio', label: 'Elogio', icon: '⭐', cor: '#27500a', bg: '#eaf3de' },
  { id: 'sugestao', label: 'Sugestão', icon: '💡', cor: '#854f0b', bg: '#faeeda' },
  { id: 'alerta', label: 'Alerta', icon: '⚠️', cor: '#791f1f', bg: '#fce8e8' },
  { id: 'feedback', label: 'Feedback geral', icon: '💬', cor: '#0c447c', bg: '#e6f1fb' },
]

const VISIBILIDADES = [
  { id: 'privado', label: 'Privado (só para o destinatário)', icon: '🔒' },
  { id: 'coordenacao', label: 'Destinatário + Coordenação/Diretora', icon: '👥' },
  { id: 'publico', label: 'Todos podem ver', icon: '🌐' },
]

const DESTINO_TIPOS = [
  { id: 'pessoa', label: 'Pessoa específica' },
  { id: 'equipe_ref', label: 'Toda a equipe de Referência' },
  { id: 'equipe_apoio', label: 'Toda a equipe de Apoio' },
  { id: 'todos', label: 'Todos' },
]

const GRUPOS_GESTAO = ['Administrador', 'Coordenadora', 'Diretora']

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

function getUsuarios() {
  return lsGet('integral_usuarios', []).filter(u => u.ativo)
}

function podeVerFeedback(fb, user) {
  if (!user) return false
  if (fb.autor_id === user.id) return true
  if (fb.visibilidade === 'publico') return true
  const ehGestao = GRUPOS_GESTAO.includes(user.grupo) || user.is_admin
  if (fb.visibilidade === 'coordenacao' && ehGestao) return true
  if (fb.destinatario_tipo === 'pessoa' && fb.destinatario_id === user.id) return true
  if (fb.destinatario_tipo === 'equipe_ref' && user.grupo === 'Professor Referência') return true
  if (fb.destinatario_tipo === 'equipe_apoio' && user.grupo === 'Apoio') return true
  if (fb.destinatario_tipo === 'todos') return true
  return false
}

export default function Feedbacks() {
  const { user } = useAuth()
  const { showToast } = useApp()
  const [feedbacks, setFeedbacks] = useState(() => lsGet('integral_feedbacks', []))
  const [usuarios] = useState(getUsuarios)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtro, setFiltro] = useState('recebidos')
  const [tipoFiltro, setTipoFiltro] = useState('')

  const [form, setForm] = useState({
    tipo: 'feedback',
    destinatario_tipo: 'pessoa',
    destinatario_id: '',
    visibilidade: 'privado',
    anonimo: false,
    titulo: '',
    conteudo: '',
    contexto: '',
  })

  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'integral_feedbacks') setFeedbacks(lsGet('integral_feedbacks', []))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function salvar() {
    if (!form.titulo.trim() || !form.conteudo.trim()) return
    if (form.destinatario_tipo === 'pessoa' && !form.destinatario_id) return
    const destinatario = usuarios.find(u => u.id === form.destinatario_id)
    const novo = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      autor_id: user.id,
      autor_nome: form.anonimo ? 'Anônimo' : user.nome,
      autor_real: user.id,
      anonimo: form.anonimo,
      tipo: form.tipo,
      destinatario_tipo: form.destinatario_tipo,
      destinatario_id: form.destinatario_id || null,
      destinatario_nome: destinatario?.nome || DESTINO_TIPOS.find(d => d.id === form.destinatario_tipo)?.label || '',
      visibilidade: form.visibilidade,
      titulo: form.titulo.trim(),
      conteudo: form.conteudo.trim(),
      contexto: form.contexto.trim(),
      reacoes: {},
    }
    const n = [novo, ...feedbacks]
    setFeedbacks(n)
    lsSet('integral_feedbacks', n)
    setForm({ tipo: 'feedback', destinatario_tipo: 'pessoa', destinatario_id: '', visibilidade: 'privado', anonimo: false, titulo: '', conteudo: '', contexto: '' })
    setMostrarForm(false)
    showToast('Feedback enviado!')
  }

  function reagir(id, emoji) {
    const n = feedbacks.map(f => {
      if (f.id !== id) return f
      const r = { ...(f.reacoes || {}) }
      const lista = r[emoji] || []
      r[emoji] = lista.includes(user.id) ? lista.filter(x => x !== user.id) : [...lista, user.id]
      if (r[emoji].length === 0) delete r[emoji]
      return { ...f, reacoes: r }
    })
    setFeedbacks(n)
    lsSet('integral_feedbacks', n)
  }

  const visiveis = useMemo(() => feedbacks.filter(f => podeVerFeedback(f, user)), [feedbacks, user])

  const filtrados = useMemo(() => {
    let lista = visiveis
    if (filtro === 'recebidos') lista = lista.filter(f => f.autor_id !== user.id && (f.destinatario_id === user.id || ['equipe_ref', 'equipe_apoio', 'todos'].includes(f.destinatario_tipo)))
    if (filtro === 'enviados') lista = lista.filter(f => f.autor_id === user.id)
    if (tipoFiltro) lista = lista.filter(f => f.tipo === tipoFiltro)
    return lista
  }, [visiveis, filtro, tipoFiltro, user])

  const destinatariosDisponiveis = usuarios.filter(u => u.id !== user.id)

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">💬</span> Feedbacks</div>
          <div className="page-subtitle">Avaliação 360 — elogios, sugestões, alertas e feedbacks entre a equipe</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>+ Novo feedback</button>
        </div>
      </div>

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Escrever feedback</div>

          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Tipo</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TIPOS.map(t => (
                <button key={t.id} type="button" onClick={() => setForm(p => ({ ...p, tipo: t.id }))}
                  style={{ padding: '6px 14px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${form.tipo === t.id ? t.cor : 'var(--warm3)'}`, background: form.tipo === t.id ? t.bg : '#fff', color: form.tipo === t.id ? t.cor : 'var(--ink3)', fontWeight: form.tipo === t.id ? 600 : 400 }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Destinatário</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {DESTINO_TIPOS.map(d => (
                <button key={d.id} type="button" onClick={() => setForm(p => ({ ...p, destinatario_tipo: d.id, destinatario_id: '' }))}
                  style={{ padding: '5px 12px', borderRadius: 14, fontSize: 11, cursor: 'pointer', border: `1.5px solid ${form.destinatario_tipo === d.id ? 'var(--sage)' : 'var(--warm3)'}`, background: form.destinatario_tipo === d.id ? 'var(--sage-light)' : '#fff', color: form.destinatario_tipo === d.id ? 'var(--sage-dark)' : 'var(--ink3)' }}>
                  {d.label}
                </button>
              ))}
            </div>
            {form.destinatario_tipo === 'pessoa' && (
              <select className="form-input" value={form.destinatario_id} onChange={e => setForm(p => ({ ...p, destinatario_id: e.target.value }))}>
                <option value="">— Selecione a pessoa —</option>
                {destinatariosDisponiveis.map(u => <option key={u.id} value={u.id}>{u.nome} ({u.grupo})</option>)}
              </select>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Visibilidade</label>
            <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
              {VISIBILIDADES.map(v => (
                <label key={v.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', background: form.visibilidade === v.id ? 'var(--warm)' : 'transparent', fontSize: 12, color: 'var(--ink2)' }}>
                  <input type="radio" checked={form.visibilidade === v.id} onChange={() => setForm(p => ({ ...p, visibilidade: v.id }))} />
                  {v.icon} {v.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--ink2)' }}>
              <input type="checkbox" checked={form.anonimo} onChange={e => setForm(p => ({ ...p, anonimo: e.target.checked }))} />
              Enviar anonimamente (seu nome não aparece para os outros)
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Título *</label>
            <input className="form-input" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Resumo curto do feedback" />
          </div>
          <div className="form-group">
            <label className="form-label">Mensagem *</label>
            <textarea className="form-input" style={{ minHeight: 100 }} value={form.conteudo} onChange={e => setForm(p => ({ ...p, conteudo: e.target.value }))} placeholder="Descreva com clareza e respeito" />
          </div>
          <div className="form-group">
            <label className="form-label">Contexto (opcional)</label>
            <input className="form-input" value={form.contexto} onChange={e => setForm(p => ({ ...p, contexto: e.target.value }))} placeholder="Ex: atividade de culinária da quarta, dia 10/04" />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={salvar}>📤 Enviar</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setMostrarForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {[{ id: 'recebidos', label: '📥 Recebidos' }, { id: 'enviados', label: '📤 Enviados' }, { id: 'todos', label: 'Todos visíveis' }].map(f => (
          <button key={f.id} onClick={() => setFiltro(f.id)}
            style={{ padding: '5px 14px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${filtro === f.id ? 'var(--sage)' : 'var(--warm3)'}`, background: filtro === f.id ? '#e8f0eb' : '#fff', color: filtro === f.id ? '#2d5240' : 'var(--ink3)', fontWeight: filtro === f.id ? 600 : 400 }}>
            {f.label}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--warm3)', margin: '0 4px' }} />
        <button onClick={() => setTipoFiltro('')}
          style={{ padding: '5px 14px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${!tipoFiltro ? 'var(--ink3)' : 'var(--warm3)'}`, background: '#fff', color: 'var(--ink3)' }}>
          Todos tipos
        </button>
        {TIPOS.map(t => (
          <button key={t.id} onClick={() => setTipoFiltro(t.id)}
            style={{ padding: '5px 14px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${tipoFiltro === t.id ? t.cor : 'var(--warm3)'}`, background: tipoFiltro === t.id ? t.bg : '#fff', color: tipoFiltro === t.id ? t.cor : 'var(--ink3)' }}>
            {t.icon} {t.label}
          </button>
        ))}
        <span style={{ fontSize: 12, color: 'var(--ink4)', alignSelf: 'center', marginLeft: 'auto' }}>{filtrados.length} feedback(s)</span>
      </div>

      {/* Lista */}
      {filtrados.map(fb => {
        const tipo = TIPOS.find(t => t.id === fb.tipo)
        const vis = VISIBILIDADES.find(v => v.id === fb.visibilidade)
        return (
          <div key={fb.id} style={{ background: '#fff', border: `1px solid var(--warm3)`, borderLeft: `4px solid ${tipo?.cor || '#888'}`, borderRadius: 'var(--r)', padding: '14px 18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: tipo?.bg, color: tipo?.cor }}>{tipo?.icon} {tipo?.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{fb.titulo}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink4)' }}>{vis?.icon} {vis?.label.split(' ')[0]}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 8 }}>
              <strong>{fb.autor_nome}</strong> → {fb.destinatario_nome}
              {fb.contexto && <span> · {fb.contexto}</span>}
              <span style={{ marginLeft: 8, color: 'var(--ink4)' }}>{new Date(fb.created_at).toLocaleDateString('pt-BR')} {new Date(fb.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 10 }}>{fb.conteudo}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['👍', '❤️', '🙌', '💡'].map(em => {
                const reagiu = fb.reacoes?.[em]?.includes(user.id)
                const count = fb.reacoes?.[em]?.length || 0
                return (
                  <button key={em} onClick={() => reagir(fb.id, em)}
                    style={{ padding: '3px 10px', borderRadius: 14, fontSize: 12, cursor: 'pointer', border: `1px solid ${reagiu ? 'var(--sage)' : 'var(--warm3)'}`, background: reagiu ? 'var(--sage-light)' : '#fff' }}>
                    {em} {count > 0 && count}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {filtrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <div style={{ fontSize: 15 }}>Nenhum feedback {filtro === 'recebidos' ? 'recebido' : filtro === 'enviados' ? 'enviado' : 'encontrado'}.</div>
        </div>
      )}
    </div>
  )
}
