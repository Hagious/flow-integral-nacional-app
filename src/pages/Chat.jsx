import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const CANAIS_PADRAO = [
  { id: 'geral', nome: '📢 Geral', tipo: 'canal', descricao: 'Comunicação aberta para toda a equipe' },
  { id: 'referencia', nome: '👩‍🏫 Referência', tipo: 'canal', grupo: 'Professor Referência', descricao: 'Apenas educadoras de referência' },
  { id: 'apoio', nome: '🤝 Apoio', tipo: 'canal', grupo: 'Apoio', descricao: 'Apenas equipe de apoio' },
  { id: 'coordenacao', nome: '🏛️ Coordenação', tipo: 'canal', grupos: ['Administrador', 'Coordenadora', 'Diretora'], descricao: 'Apenas gestão' },
]

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

function dmKey(a, b) {
  return `dm_${[a, b].sort().join('_')}`
}

function podeVerCanal(canal, user) {
  if (canal.tipo !== 'canal') return true
  if (canal.id === 'geral') return true
  if (canal.grupo) return user.grupo === canal.grupo || user.is_admin
  if (canal.grupos) return canal.grupos.includes(user.grupo) || user.is_admin
  return true
}

export default function Chat() {
  const { user } = useAuth()
  const [mensagens, setMensagens] = useState(() => lsGet('integral_chat_mensagens', []))
  const [usuarios] = useState(() => lsGet('integral_usuarios', []).filter(u => u.ativo))
  const [canalAtivo, setCanalAtivo] = useState('geral')
  const [texto, setTexto] = useState('')
  const [filtroBusca, setFiltroBusca] = useState('')
  const listaRef = useRef(null)

  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'integral_chat_mensagens') setMensagens(lsGet('integral_chat_mensagens', []))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const canaisVisiveis = CANAIS_PADRAO.filter(c => podeVerCanal(c, user))

  const mensagensCanal = useMemo(() => {
    return mensagens.filter(m => m.canal === canalAtivo).sort((a, b) => a.created_at.localeCompare(b.created_at))
  }, [mensagens, canalAtivo])

  useEffect(() => {
    if (listaRef.current) listaRef.current.scrollTop = listaRef.current.scrollHeight
  }, [mensagensCanal.length, canalAtivo])

  // Marcar como lido ao abrir canal
  useEffect(() => {
    const lidos = lsGet('integral_chat_lidos', {})
    lidos[`${user.id}_${canalAtivo}`] = new Date().toISOString()
    lsSet('integral_chat_lidos', lidos)
  }, [canalAtivo, user.id])

  function enviar() {
    if (!texto.trim()) return
    const nova = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      canal: canalAtivo,
      autor_id: user.id,
      autor_nome: user.nome,
      autor_grupo: user.grupo,
      texto: texto.trim(),
      created_at: new Date().toISOString(),
    }
    const n = [...mensagens, nova]
    setMensagens(n)
    lsSet('integral_chat_mensagens', n)
    setTexto('')
  }

  function naoLidas(canalId) {
    const lidos = lsGet('integral_chat_lidos', {})
    const ultimoLido = lidos[`${user.id}_${canalId}`] || '1970'
    return mensagens.filter(m => m.canal === canalId && m.autor_id !== user.id && m.created_at > ultimoLido).length
  }

  const canalInfo = canaisVisiveis.find(c => c.id === canalAtivo) || CANAIS_PADRAO.find(c => c.id === canalAtivo)
  const dmUser = canalAtivo.startsWith('dm_') ? usuarios.find(u => canalAtivo.includes(u.id) && u.id !== user.id) : null
  const canalLabel = dmUser ? `💬 ${dmUser.nome}` : canalInfo?.nome || canalAtivo
  const canalDesc = dmUser ? `Mensagem direta · ${dmUser.grupo}` : canalInfo?.descricao || ''

  const dmsAbertas = useMemo(() => {
    const set = new Set()
    mensagens.forEach(m => {
      if (m.canal.startsWith('dm_') && m.canal.includes(user.id)) set.add(m.canal)
    })
    return Array.from(set).map(canalId => {
      const outroId = canalId.replace('dm_', '').split('_').find(id => id !== user.id)
      const outro = usuarios.find(u => u.id === outroId)
      return { id: canalId, nome: outro?.nome || 'Usuário', grupo: outro?.grupo || '' }
    })
  }, [mensagens, usuarios, user.id])

  const buscaFiltrada = usuarios.filter(u => u.id !== user.id && u.nome.toLowerCase().includes(filtroBusca.toLowerCase()))

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">💬</span> Chat interno</div>
          <div className="page-subtitle">Mensagens entre a equipe — canais e conversas diretas</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 200px)', minHeight: 500 }}>
        {/* Sidebar canais */}
        <div style={{ width: 260, background: '#fff', border: '1px solid var(--warm3)', borderRadius: 'var(--r)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--warm3)', fontSize: 11, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Canais
          </div>
          <div style={{ padding: 8 }}>
            {canaisVisiveis.map(c => {
              const nl = naoLidas(c.id)
              const ativo = canalAtivo === c.id
              return (
                <button key={c.id} onClick={() => setCanalAtivo(c.id)}
                  style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '8px 12px', borderRadius: 6, background: ativo ? 'var(--sage-light)' : 'transparent', border: 'none', cursor: 'pointer', color: ativo ? 'var(--sage-dark)' : 'var(--ink2)', fontSize: 13, fontWeight: ativo ? 600 : 400, textAlign: 'left', marginBottom: 2 }}>
                  <span style={{ flex: 1 }}>{c.nome}</span>
                  {nl > 0 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'var(--terracotta)', color: '#fff', fontWeight: 700 }}>{nl}</span>}
                </button>
              )
            })}
          </div>

          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--warm3)', borderBottom: '1px solid var(--warm3)', fontSize: 11, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Conversas diretas
          </div>
          <div style={{ padding: 8 }}>
            {dmsAbertas.map(d => {
              const nl = naoLidas(d.id)
              const ativo = canalAtivo === d.id
              return (
                <button key={d.id} onClick={() => setCanalAtivo(d.id)}
                  style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '8px 12px', borderRadius: 6, background: ativo ? 'var(--sage-light)' : 'transparent', border: 'none', cursor: 'pointer', color: ativo ? 'var(--sage-dark)' : 'var(--ink2)', fontSize: 13, fontWeight: ativo ? 600 : 400, textAlign: 'left', marginBottom: 2 }}>
                  <span style={{ flex: 1 }}>💬 {d.nome}</span>
                  {nl > 0 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'var(--terracotta)', color: '#fff', fontWeight: 700 }}>{nl}</span>}
                </button>
              )
            })}
            {dmsAbertas.length === 0 && <div style={{ fontSize: 11, color: 'var(--ink4)', padding: '4px 12px' }}>Nenhuma conversa ainda</div>}
          </div>

          <div style={{ flex: 1, padding: '12px 14px', borderTop: '1px solid var(--warm3)', overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Iniciar conversa</div>
            <input className="form-input" style={{ fontSize: 12, padding: '6px 10px', marginBottom: 8 }} placeholder="Buscar pessoa..." value={filtroBusca} onChange={e => setFiltroBusca(e.target.value)} />
            {buscaFiltrada.slice(0, 10).map(u => (
              <button key={u.id} onClick={() => { setCanalAtivo(dmKey(user.id, u.id)); setFiltroBusca('') }}
                style={{ display: 'block', width: '100%', padding: '6px 10px', borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink2)', fontSize: 12, textAlign: 'left' }}>
                {u.nome} <span style={{ fontSize: 10, color: 'var(--ink4)' }}>({u.grupo})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mensagens */}
        <div style={{ flex: 1, background: '#fff', border: '1px solid var(--warm3)', borderRadius: 'var(--r)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--warm3)' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, color: 'var(--ink)' }}>{canalLabel}</div>
            {canalDesc && <div style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 2 }}>{canalDesc}</div>}
          </div>

          <div ref={listaRef} style={{ flex: 1, overflowY: 'auto', padding: 16, background: 'var(--warm)' }}>
            {mensagensCanal.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink4)', fontSize: 13 }}>
                Nenhuma mensagem ainda. Seja o primeiro a escrever.
              </div>
            )}
            {mensagensCanal.map((m, i) => {
              const mine = m.autor_id === user.id
              const prev = mensagensCanal[i - 1]
              const sameAutor = prev && prev.autor_id === m.autor_id && (new Date(m.created_at) - new Date(prev.created_at)) < 5 * 60 * 1000
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: mine ? 'row-reverse' : 'row', marginBottom: sameAutor ? 2 : 10, gap: 8 }}>
                  {!sameAutor && (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: mine ? 'var(--sage)' : 'var(--terracotta)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                      {m.autor_nome.substring(0, 1).toUpperCase()}
                    </div>
                  )}
                  {sameAutor && <div style={{ width: 32, flexShrink: 0 }} />}
                  <div style={{ maxWidth: '70%' }}>
                    {!sameAutor && (
                      <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 2, textAlign: mine ? 'right' : 'left' }}>
                        <strong>{mine ? 'Você' : m.autor_nome}</strong>
                        {!mine && <span style={{ marginLeft: 6, color: 'var(--ink4)' }}>{m.autor_grupo}</span>}
                        <span style={{ marginLeft: 6, color: 'var(--ink4)' }}>{new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    <div style={{ background: mine ? 'var(--sage)' : '#fff', color: mine ? '#fff' : 'var(--ink)', padding: '8px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', border: mine ? 'none' : '1px solid var(--warm3)' }}>
                      {m.texto}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ padding: 12, borderTop: '1px solid var(--warm3)', display: 'flex', gap: 8 }}>
            <textarea
              className="form-input"
              style={{ flex: 1, minHeight: 40, maxHeight: 120, resize: 'none', fontSize: 13 }}
              placeholder="Escreva uma mensagem... (Enter para enviar, Shift+Enter para quebrar linha)"
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  enviar()
                }
              }}
            />
            <button className="btn btn-primary btn-sm" onClick={enviar} disabled={!texto.trim()} style={{ opacity: texto.trim() ? 1 : 0.5 }}>
              ➤ Enviar
            </button>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 10, textAlign: 'center' }}>
        ℹ️ Mensagens salvas localmente no navegador. A sincronização entre dispositivos requer configuração do Supabase.
      </div>
    </div>
  )
}
