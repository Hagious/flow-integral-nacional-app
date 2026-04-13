import { useState } from 'react'
import { useApp } from '../context/AppContext'

const EIXOS = [
  { icon: '🤝', label: 'Social (interação, conflitos, cooperação)' },
  { icon: '🚶', label: 'Autonomia (cuidados pessoais, responsabilidades)' },
  { icon: '🧠', label: 'Cognitivo (curiosidade, participação, investigação)' },
  { icon: '🌿', label: 'Relação com o ambiente (horta, animais, materiais)' },
  { icon: '📝', label: 'Observação geral' },
]

function ChildCard({ child, onUpdate, onAddObs }) {
  const [open, setOpen] = useState(false)
  const [obsForm, setObsForm] = useState({ data: new Date().toISOString().split('T')[0], ...Object.fromEntries(EIXOS.map((e, i) => [i, ''])) })
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({ nome: child.nome, nasc: child.nasc || '' })

  const age = child.nasc ? (() => {
    const diff = Date.now() - new Date(child.nasc).getTime()
    const y = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
    return y > 0 ? `${y} ano${y > 1 ? 's' : ''}` : 'Menos de 1 ano'
  })() : 'Idade não informada'

  return (
    <div className="child-card">
      <div className="child-header" onClick={() => setOpen(!open)}>
        <div className="avatar" style={{ width: 38, height: 38, fontSize: 15, background: child.cor[0], color: child.cor[1] }}>
          {child.nome.substring(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{child.nome}</div>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
            {age} · {child.nasc ? child.nasc.split('-').reverse().join('/') : 'Nascimento não informado'} · {child.obs?.length || 0} observações
          </div>
        </div>
        <span style={{ fontSize: 18, color: 'var(--ink4)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
      </div>

      {open && (
        <div className="child-body">
          {editMode ? (
            <div style={{ marginBottom: 16 }}>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Nome</label><input className="form-input" value={editData.nome} onChange={e => setEditData(p => ({ ...p, nome: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Data de nascimento</label><input type="date" className="form-input" value={editData.nasc} onChange={e => setEditData(p => ({ ...p, nasc: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => { onUpdate(child.id, editData); setEditMode(false) }}>Salvar</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-ghost btn-xs" onClick={() => setEditMode(true)}>✏️ Editar dados</button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink2)' }}>Nova observação</div>
          </div>

          <div style={{ background: 'var(--warm)', borderRadius: 'var(--r)', padding: 14, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Data</label>
              <input type="date" className="form-input" value={obsForm.data} onChange={e => setObsForm(p => ({ ...p, data: e.target.value }))} />
            </div>
            {EIXOS.map((eixo, i) => (
              <div key={i} className="obs-eixo">
                <div className="obs-eixo-title">{eixo.icon} {eixo.label}</div>
                <textarea
                  className="form-input"
                  style={{ minHeight: 60, background: 'var(--white)' }}
                  placeholder="Registre..."
                  value={obsForm[i]}
                  onChange={e => setObsForm(p => ({ ...p, [i]: e.target.value }))}
                />
              </div>
            ))}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                const hasContent = EIXOS.some((_, i) => obsForm[i])
                if (!hasContent) return
                onAddObs(child.id, { data: obsForm.data, eixos: EIXOS.map((e, i) => ({ label: e.label, icon: e.icon, texto: obsForm[i] })).filter(e => e.texto) })
                setObsForm({ data: new Date().toISOString().split('T')[0], ...Object.fromEntries(EIXOS.map((e, i) => [i, ''])) })
              }}
            >
              + Salvar observação
            </button>
          </div>

          {child.obs?.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Histórico de observações</div>
              {child.obs.map(o => (
                <div key={o.id} style={{ background: 'var(--warm)', borderRadius: 'var(--r2)', padding: '12px 14px', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 6, fontWeight: 500 }}>
                    📅 {o.data?.split('-').reverse().join('/')}
                  </div>
                  {o.eixos?.map((e, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink2)' }}>{e.icon} {e.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2 }}>{e.texto}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Criancas() {
  const { children, addChild, updateChild, addChildObs } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', nasc: '' })

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">🧒</span> Crianças</div>
          <div className="page-subtitle">Fichas individuais e acompanhamento do desenvolvimento</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Nova Criança</button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Cadastrar criança</div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Nome</label><input className="form-input" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome da criança" /></div>
            <div className="form-group"><label className="form-label">Data de nascimento</label><input type="date" className="form-input" value={form.nasc} onChange={e => setForm(p => ({ ...p, nasc: e.target.value }))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => { if (!form.nome) return; addChild(form); setForm({ nome: '', nasc: '' }); setShowForm(false) }}>Adicionar</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {children.map(child => (
        <ChildCard key={child.id} child={child} onUpdate={updateChild} onAddObs={addChildObs} />
      ))}

      {children.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧒</div>
          <div style={{ fontSize: 15 }}>Nenhuma criança cadastrada ainda.</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Clique em "Nova Criança" para começar.</div>
        </div>
      )}
    </div>
  )
}
