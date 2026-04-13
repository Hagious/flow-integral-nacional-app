import { useState } from 'react'
import { useApp } from '../context/AppContext'

const DIAS_SEMANA = [
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
]

const EMOJIS_SUGERIDOS = ['🌱','🐦','🚿','☕','🍽️','📚','🧹','📋','🦷','🛁','🧼','🎨','📖','🎵','🧺','🏃','🌳','💧','🪴','🍎']

export default function Rotina() {
  const { rotinaItems, updateRotinaItems, showToast } = useApp()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ icon: '🌱', label: '', dias: [1, 2, 3, 4, 5] })

  function iniciarNovo() {
    setEditing('novo')
    setForm({ icon: '🌱', label: '', dias: [1, 2, 3, 4, 5] })
  }
  function iniciarEdicao(item) {
    setEditing(item.id)
    setForm({ icon: item.icon, label: item.label, dias: item.dias || [1, 2, 3, 4, 5] })
  }
  function cancelar() { setEditing(null) }

  function toggleDia(id) {
    setForm(p => ({ ...p, dias: p.dias.includes(id) ? p.dias.filter(d => d !== id) : [...p.dias, id].sort() }))
  }

  function salvar() {
    if (!form.label.trim()) return
    if (editing === 'novo') {
      const novo = { id: Date.now().toString(), icon: form.icon, label: form.label.trim(), dias: form.dias }
      updateRotinaItems([...rotinaItems, novo])
      showToast('Item adicionado')
    } else {
      updateRotinaItems(rotinaItems.map(it => it.id === editing ? { ...it, icon: form.icon, label: form.label.trim(), dias: form.dias } : it))
      showToast('Item atualizado')
    }
    setEditing(null)
  }

  function remover(id) {
    if (!confirm('Remover este item do checklist?')) return
    updateRotinaItems(rotinaItems.filter(it => it.id !== id))
    showToast('Item removido')
  }

  function mover(idx, delta) {
    const n = [...rotinaItems]
    const alvo = idx + delta
    if (alvo < 0 || alvo >= n.length) return
    ;[n[idx], n[alvo]] = [n[alvo], n[idx]]
    updateRotinaItems(n)
  }

  const diasLabel = (dias) => {
    if (!dias || dias.length === 0) return 'Nenhum dia'
    if (dias.length === 5) return 'Todos os dias'
    return dias.map(id => DIAS_SEMANA.find(d => d.id === id)?.label).join(', ')
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">✅</span> Rotina do Dia — Cadastro</div>
          <div className="page-subtitle">Configure o checklist padrão. A execução diária acontece no Registro do Dia.</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={iniciarNovo}>+ Novo item</button>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        ℹ️ Os itens desta lista aparecem automaticamente no <strong>Registro do Dia</strong> conforme os dias da semana configurados. Itens marcados apenas para alguns dias só aparecem nesses dias — isso evita redundância com o planejamento.
      </div>

      {editing && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">{editing === 'novo' ? 'Novo item' : 'Editar item'}</div>
          <div className="form-group">
            <label className="form-label">Ícone</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {EMOJIS_SUGERIDOS.map(e => (
                <button key={e} type="button" onClick={() => setForm(p => ({ ...p, icon: e }))}
                  style={{ fontSize: 22, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', border: `2px solid ${form.icon === e ? 'var(--sage)' : 'var(--warm3)'}`, background: form.icon === e ? 'var(--sage-light)' : '#fff' }}>
                  {e}
                </button>
              ))}
            </div>
            <input className="form-input" style={{ width: 120 }} value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="Ou digite outro" />
          </div>

          <div className="form-group">
            <label className="form-label">Nome do item *</label>
            <input className="form-input" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Ex: Horta, Café da manhã, Banho..." />
          </div>

          <div className="form-group">
            <label className="form-label">Dias em que este item se repete</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {DIAS_SEMANA.map(d => {
                const sel = form.dias.includes(d.id)
                return (
                  <button key={d.id} type="button" onClick={() => toggleDia(d.id)}
                    style={{ padding: '6px 16px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${sel ? 'var(--sage)' : 'var(--warm3)'}`, background: sel ? 'var(--sage-light)' : '#fff', color: sel ? 'var(--sage-dark)' : 'var(--ink3)', fontWeight: sel ? 600 : 400 }}>
                    {sel ? '✓ ' : ''}{d.label}
                  </button>
                )
              })}
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => setForm(p => ({ ...p, dias: [1, 2, 3, 4, 5] }))}>Todos</button>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => setForm(p => ({ ...p, dias: [] }))}>Limpar</button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink4)' }}>
              Selecione os dias da semana em que este item deve ser verificado. Itens sem dias marcados não aparecerão no Registro do Dia.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={salvar}>💾 Salvar</button>
            <button className="btn btn-ghost btn-sm" onClick={cancelar}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
        Itens do checklist ({rotinaItems.length})
      </div>

      {rotinaItems.map((item, idx) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid var(--warm3)', borderRadius: 'var(--r2)', padding: '12px 16px', marginBottom: 8 }}>
          <div style={{ fontSize: 24 }}>{item.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{item.label}</div>
            <div style={{ fontSize: 11, color: 'var(--ink3)' }}>📅 {diasLabel(item.dias)}</div>
          </div>
          <button className="btn btn-ghost btn-xs" onClick={() => mover(idx, -1)} disabled={idx === 0} title="Subir">↑</button>
          <button className="btn btn-ghost btn-xs" onClick={() => mover(idx, 1)} disabled={idx === rotinaItems.length - 1} title="Descer">↓</button>
          <button className="btn btn-ghost btn-xs" onClick={() => iniciarEdicao(item)}>✏️</button>
          <button className="btn btn-ghost btn-xs" onClick={() => remover(item.id)} style={{ color: '#a32d2d' }}>🗑️</button>
        </div>
      ))}

      {rotinaItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 15 }}>Nenhum item cadastrado.</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Clique em "Novo item" para começar.</div>
        </div>
      )}
    </div>
  )
}
