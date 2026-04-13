import { useState, useEffect } from 'react'
import { useAuth, MODULOS, GRUPOS_PADRAO, registrarAuditoria } from '../context/AuthContext.jsx'

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

const GRUPOS = Object.keys(GRUPOS_PADRAO)
const CATS = ['principal', 'pedagogico', 'diario', 'equipe', 'admin']
const CAT_LABELS = { principal: 'Principal', pedagogico: 'Pedagógico', diario: 'Diário', equipe: 'Equipe', admin: 'Administração' }

// ─── Tab Grupos ───────────────────────────────────────────────
function TabGrupos() {
  const [grupoSel, setGrupoSel] = useState('Administrador')
  const [permGrupo, setPermGrupo] = useState(() => {
    const saved = lsGet('integral_perm_grupos', null)
    return saved || Object.fromEntries(GRUPOS.map(g => [g, GRUPOS_PADRAO[g].permissoes]))
  })

  function togglePerm(grupo, modulo, campo) {
    setPermGrupo(p => {
      const n = { ...p, [grupo]: { ...p[grupo], [modulo]: { ...p[grupo][modulo], [campo]: !p[grupo][modulo][campo] } } }
      lsSet('integral_perm_grupos', n)
      return n
    })
  }

  const grupo = GRUPOS_PADRAO[grupoSel]

  return (
    <div>
      {/* Seletor de grupo */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {GRUPOS.map(g => (
          <button
            key={g} onClick={() => setGrupoSel(g)}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              border: `2px solid ${grupoSel === g ? GRUPOS_PADRAO[g].cor : 'var(--warm3)'}`,
              background: grupoSel === g ? GRUPOS_PADRAO[g].cor + '20' : '#fff',
              color: grupoSel === g ? GRUPOS_PADRAO[g].cor : 'var(--ink3)',
              fontWeight: grupoSel === g ? 600 : 400,
            }}
          >{g}</button>
        ))}
      </div>

      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        ℹ️ Permissões do grupo <strong>{grupoSel}</strong> — servem como padrão para todos os usuários desse grupo. Permissões individuais sobrescrevem estas.
      </div>

      {/* Matriz de permissões */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--warm2)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', width: 200 }}>Módulo</th>
              {['Ver', 'Criar', 'Editar', 'Excluir'].map(p => (
                <th key={p} style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 500, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', width: 80 }}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATS.map(cat => {
              const mods = MODULOS.filter(m => m.categoria === cat)
              return [
                <tr key={cat}>
                  <td colSpan={5} style={{ padding: '8px 14px', background: 'var(--warm)', fontSize: 10, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {CAT_LABELS[cat]}
                  </td>
                </tr>,
                ...mods.map(m => {
                  const p = permGrupo[grupoSel]?.[m.id] || {}
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--warm3)' }}>
                      <td style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{m.icone}</span>
                        <span style={{ color: 'var(--ink2)' }}>{m.nome}</span>
                      </td>
                      {[['ver','Ver'],['criar','Criar'],['editar','Editar'],['excluir','Excluir']].map(([campo, label]) => (
                        <td key={campo} style={{ textAlign: 'center', padding: '9px 14px' }}>
                          <button
                            onClick={() => togglePerm(grupoSel, m.id, campo)}
                            style={{
                              width: 26, height: 26, borderRadius: 6, border: 'none', cursor: 'pointer',
                              background: p[campo] ? (campo === 'excluir' ? '#fce8e8' : 'var(--sage-light)') : 'var(--warm2)',
                              color: p[campo] ? (campo === 'excluir' ? '#a32d2d' : 'var(--sage-dark)') : 'var(--ink4)',
                              fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
                            }}
                            title={`${p[campo] ? 'Remover' : 'Conceder'} permissão de ${label}`}
                          >
                            {p[campo] ? '✓' : '—'}
                          </button>
                        </td>
                      ))}
                    </tr>
                  )
                })
              ]
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab Usuários ─────────────────────────────────────────────
function TabUsuarios() {
  const { user: currentUser } = useAuth()
  const [usuarios, setUsuarios] = useState(() => lsGet('integral_usuarios', [
    { id: 'admin-1', nome: 'Administrador', email: 'admin@integral.com', senha: 'admin123', grupo: 'Administrador', is_admin: true, ativo: true },
    { id: 'micheline-1', nome: 'Micheline', email: 'micheline@integral.com', senha: 'prof123', grupo: 'Professor Referência', is_admin: false, ativo: true },
    { id: 'erica-1', nome: 'Érica', email: 'erica@integral.com', senha: 'prof123', grupo: 'Professor Referência', is_admin: false, ativo: true },
    { id: 'thais-1', nome: 'Thaís', email: 'thais@integral.com', senha: 'prof123', grupo: 'Professor Referência', is_admin: false, ativo: true },
    { id: 'halyssa-1', nome: 'Halyssa', email: 'halyssa@integral.com', senha: 'apoio123', grupo: 'Apoio', is_admin: false, ativo: true },
    { id: 'dayane-1', nome: 'Dayane', email: 'dayane@integral.com', senha: 'apoio123', grupo: 'Apoio', is_admin: false, ativo: true },
  ]))
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', grupo: 'Apoio', is_admin: false })
  const [showForm, setShowForm] = useState(false)
  const [permIndiv, setPermIndiv] = useState(null) // usuário com permissões individuais abertas

  function save(data) {
    const dadosAntes = usuarios.find(u => u.id === data.id)
    if (editando) {
      const n = usuarios.map(u => u.id === editando ? { ...u, ...data } : u)
      setUsuarios(n); lsSet('integral_usuarios', n)
      registrarAuditoria('editar', 'usuarios', editando, dadosAntes, data, currentUser?.nome)
    } else {
      const novo = { ...data, id: Date.now().toString(), ativo: true }
      const n = [...usuarios, novo]
      setUsuarios(n); lsSet('integral_usuarios', n)
      registrarAuditoria('criar', 'usuarios', novo.id, null, novo, currentUser?.nome)
    }
    setEditando(null); setShowForm(false)
    setForm({ nome: '', email: '', senha: '', grupo: 'Apoio', is_admin: false })
  }

  function toggleAtivo(id) {
    const u = usuarios.find(u => u.id === id)
    const n = usuarios.map(u => u.id === id ? { ...u, ativo: !u.ativo } : u)
    setUsuarios(n); lsSet('integral_usuarios', n)
    registrarAuditoria('editar', 'usuarios', id, { ativo: u?.ativo }, { ativo: !u?.ativo }, currentUser?.nome)
  }

  const grupoInfo = (g) => ({ cor: GRUPOS_PADRAO[g]?.cor || '#888' })

  return (
    <div>
      {!showForm && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(true); setEditando(null) }}>+ Novo usuário</button>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">{editando ? '✏️ Editar usuário' : '+ Novo usuário'}</div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Nome</label><input className="form-input" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" /></div>
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@escola.com" /></div>
            <div className="form-group"><label className="form-label">Senha</label><input type="password" className="form-input" value={form.senha} onChange={e => setForm(p => ({ ...p, senha: e.target.value }))} placeholder="••••••" /></div>
            <div className="form-group"><label className="form-label">Grupo de acesso</label>
              <select className="form-input" value={form.grupo} onChange={e => setForm(p => ({ ...p, grupo: e.target.value }))}>
                {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <input type="checkbox" id="is_admin" checked={form.is_admin} onChange={e => setForm(p => ({ ...p, is_admin: e.target.checked }))} />
            <label htmlFor="is_admin" style={{ fontSize: 13, cursor: 'pointer' }}>Este usuário também é administrador (acesso total)</label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => save(form)}>💾 Salvar</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowForm(false); setEditando(null) }}>Cancelar</button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--warm3)' }}>
            {['Usuário', 'Email', 'Grupo', 'Admin', 'Status', 'Ações'].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid var(--warm3)', opacity: u.ativo ? 1 : 0.5 }}>
              <td style={{ padding: '10px 12px', fontWeight: 500 }}>{u.nome}</td>
              <td style={{ padding: '10px 12px', color: 'var(--ink3)', fontSize: 12 }}>{u.email}</td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, background: grupoInfo(u.grupo).cor + '20', color: grupoInfo(u.grupo).cor }}>
                  {u.grupo}
                </span>
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                {u.is_admin && <span style={{ fontSize: 14 }}>⭐</span>}
              </td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, background: u.ativo ? 'var(--sage-light)' : 'var(--warm2)', color: u.ativo ? 'var(--sage-dark)' : 'var(--ink4)' }}>
                  {u.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-xs" onClick={() => { setForm(u); setEditando(u.id); setShowForm(true) }}>✏️</button>
                  <button className="btn btn-ghost btn-xs" onClick={() => setPermIndiv(permIndiv?.id === u.id ? null : u)} title="Permissões individuais">🔑</button>
                  <button className="btn btn-ghost btn-xs" onClick={() => toggleAtivo(u.id)} style={{ color: u.ativo ? 'var(--terracotta)' : 'var(--sage)' }}>
                    {u.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Permissões individuais */}
      {permIndiv && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>🔑 Permissões individuais — {permIndiv.nome}</div>
            <button className="btn btn-ghost btn-xs" onClick={() => setPermIndiv(null)}>✕ Fechar</button>
          </div>
          <div className="alert alert-info" style={{ marginBottom: 14 }}>
            ℹ️ Estas permissões <strong>sobrescrevem</strong> as do grupo <strong>{permIndiv.grupo}</strong>. Use para acesso pontual (ex: treinamento temporário). Deixe em branco para herdar do grupo.
          </div>
          <PermissoesIndividuais usuario={permIndiv} currentUser={currentUser} />
        </div>
      )}
    </div>
  )
}

function PermissoesIndividuais({ usuario, currentUser }) {
  const [perms, setPerms] = useState(() => lsGet(`integral_perm_user_${usuario.id}`, {}))

  function toggle(modulo, campo) {
    setPerms(p => {
      const curr = p[modulo]?.[campo]
      const val = curr === true ? false : curr === false ? null : true
      const n = { ...p, [modulo]: { ...(p[modulo] || {}), [campo]: val } }
      lsSet(`integral_perm_user_${usuario.id}`, n)
      registrarAuditoria('editar', 'permissoes', usuario.id, { [modulo]: p[modulo] }, { [modulo]: n[modulo] }, currentUser?.nome)
      return n
    })
  }

  const getIcon = (val) => val === true ? '✓' : val === false ? '✗' : '·'
  const getColor = (val, campo) => val === true ? 'var(--sage-dark)' : val === false ? '#a32d2d' : 'var(--ink4)'
  const getBg = (val, campo) => val === true ? 'var(--sage-light)' : val === false ? '#fce8e8' : 'var(--warm2)'

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 10 }}>
        <span style={{ color: 'var(--sage-dark)', fontWeight: 600 }}>✓</span> = Permitir &nbsp;
        <span style={{ color: '#a32d2d', fontWeight: 600 }}>✗</span> = Bloquear &nbsp;
        <span style={{ color: 'var(--ink4)' }}>·</span> = Herdar do grupo
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'var(--warm2)' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--ink3)' }}>Módulo</th>
            {['Ver','Criar','Editar','Excluir'].map(p => (
              <th key={p} style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, fontWeight: 500, color: 'var(--ink3)', width: 70 }}>{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODULOS.map(m => (
            <tr key={m.id} style={{ borderBottom: '1px solid var(--warm3)' }}>
              <td style={{ padding: '7px 12px' }}><span style={{ fontSize: 13 }}>{m.icone}</span> {m.nome}</td>
              {[['ver'],['criar'],['editar'],['excluir']].map(([campo]) => {
                const val = perms[m.id]?.[campo] ?? null
                return (
                  <td key={campo} style={{ textAlign: 'center', padding: '7px 12px' }}>
                    <button
                      onClick={() => toggle(m.id, campo)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: 'none', cursor: 'pointer', background: getBg(val, campo), color: getColor(val, campo), fontSize: 12, fontWeight: 700 }}
                    >{getIcon(val)}</button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────
export default function Usuarios() {
  const [tab, setTab] = useState('usuarios')

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">🔐</span> Usuários e Acessos</div>
          <div className="page-subtitle">Gerencie usuários, grupos e permissões por módulo</div>
        </div>
      </div>
      <div className="tabs">
        <button className={`tab${tab==='usuarios'?' active':''}`} onClick={() => setTab('usuarios')}>Usuários</button>
        <button className={`tab${tab==='grupos'?' active':''}`} onClick={() => setTab('grupos')}>Permissões por Grupo</button>
      </div>
      {tab === 'usuarios' && <TabUsuarios />}
      {tab === 'grupos' && <TabGrupos />}
    </div>
  )
}
