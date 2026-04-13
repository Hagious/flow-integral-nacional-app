import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Registros() {
  const { registros, addRegistro } = useApp()
  const [form, setForm] = useState({ data: new Date().toISOString().split('T')[0], falas: '', hipoteses: '', situacoes: '', continuidade: '' })

  function handleSave() {
    if (!form.falas && !form.hipoteses && !form.situacoes) return
    addRegistro(form)
    setForm({ data: new Date().toISOString().split('T')[0], falas: '', hipoteses: '', situacoes: '', continuidade: '' })
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">📝</span> Registros Pedagógicos</div>
          <div className="page-subtitle">Assembleias, falas e situações significativas</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Data</label>
            <input type="date" className="form-input" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} />
          </div>
          <span className="tag tag-green">Novo registro</span>
        </div>

        {[
          ['falas', '💬 Falas das crianças', '"O pássaro escolheu nossa escola porque tem muita árvore" — Bernardo, 6 anos'],
          ['hipoteses', '🔍 Hipóteses levantadas', 'O que as crianças investigaram e questionaram...'],
          ['situacoes', '⭐ Situações significativas do dia', 'Momentos que merecem ser documentados e compartilhados...'],
          ['continuidade', '🔄 Continuidade sugerida', 'O que emerge para os próximos dias...'],
        ].map(([k, label, ph]) => (
          <div className="form-group" key={k}>
            <label className="form-label">{label}</label>
            <textarea className="form-input" placeholder={ph} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
          </div>
        ))}

        <button className="btn btn-primary btn-sm" onClick={handleSave}>💾 Salvar registro</button>
      </div>

      {registros.length > 0 && (
        <div>
          <div className="sec-title">Registros anteriores</div>
          {registros.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 500 }}>📅 {r.data?.split('-').reverse().join('/')}</div>
                <span className="tag tag-gray">Assembleia</span>
              </div>
              {r.falas && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>💬 Falas</div><div style={{ fontSize: 13, color: 'var(--ink2)', fontFamily: 'Fraunces, serif', fontStyle: 'italic', lineHeight: 1.65, borderLeft: '3px solid var(--sage-mid)', paddingLeft: 12 }}>{r.falas}</div></div>}
              {r.hipoteses && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔍 Hipóteses</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{r.hipoteses}</div></div>}
              {r.situacoes && <div><div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>⭐ Situações</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{r.situacoes}</div></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
