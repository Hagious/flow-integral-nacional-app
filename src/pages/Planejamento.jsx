import { useState } from 'react'
import { useApp } from '../context/AppContext'

const SLOTS = [
  ['7h30', 'Chegada / Acolhimento'],
  ['8:00h', 'Assembleia / Leitura / Roda de conversa'],
  ['8h40', 'Café da manhã'],
  ['9h10', 'Vivência / Pesquisa'],
  ['10:00h', 'Banho / Higiene / Tarefa de casa'],
  ['11:00h', 'Finalização de vivências'],
  ['11h30', 'Almoço'],
  ['12h15', 'Escovação / Descanso / Agendas'],
  ['12h45', 'Sala de referência'],
]

function PlanSemanal() {
  const [slots, setSlots] = useState(SLOTS.map(([h, seg]) => ({ h, cells: [seg, '', '', '', ''] })))
  const [meta, setMeta] = useState({ semana: '', ref: 'Micheline e Simone', apoio: 'Érica e Halyssa', propostas: '', obs: '', revisao: '', ajustes: '', reflexao: '' })
  const { showToast } = useApp()

  function updateCell(rowIdx, colIdx, val) {
    setSlots(prev => { const n = [...prev]; n[rowIdx].cells[colIdx] = val; return n })
  }

  function addSlot() {
    setSlots(prev => [...prev, { h: '', cells: ['', '', '', '', ''] }])
  }

  function printPlan() { window.print() }

  function exportCSV() {
    const headers = ['Horário', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
    const rows = slots.map(s => [s.h, ...s.cells])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'planejamento.csv'; a.click()
    showToast('CSV exportado!')
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Semana</label>
            <input type="date" className="form-input" value={meta.semana} onChange={e => setMeta(p => ({ ...p, semana: e.target.value }))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Educadoras de referência</label>
            <input className="form-input" value={meta.ref} onChange={e => setMeta(p => ({ ...p, ref: e.target.value }))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Educadoras de apoio</label>
            <input className="form-input" value={meta.apoio} onChange={e => setMeta(p => ({ ...p, apoio: e.target.value }))} />
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="plan-table">
          <thead>
            <tr>
              <th>Horário</th>
              {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(d => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, ri) => (
              <tr key={ri}>
                <td>
                  <input
                    style={{ background: 'transparent', border: 'none', width: '100%', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 500, color: 'var(--ink2)', outline: 'none', padding: '8px 10px' }}
                    value={slot.h}
                    onChange={e => setSlots(prev => { const n = [...prev]; n[ri].h = e.target.value; return n })}
                    placeholder="00h00"
                  />
                </td>
                {slot.cells.map((cell, ci) => (
                  <td key={ci}>
                    <textarea
                      className="plan-cell"
                      value={cell}
                      onChange={e => updateCell(ri, ci, e.target.value)}
                      placeholder="..."
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addSlot}>+ Adicionar horário</button>

      <div className="grid-2" style={{ marginTop: 20 }}>
        {[
          ['propostas', 'Propostas da semana', 'Vivências, pesquisas, projetos previstos...'],
          ['obs', 'Observações gerais', 'Revezamento, agendas, avisos...'],
          ['revisao', 'Revisão semanal', 'O que foi realizado...'],
          ['ajustes', 'Ajustes necessários', 'O que mudar na próxima semana...'],
        ].map(([k, label, ph]) => (
          <div className="form-group" key={k}>
            <label className="form-label">{label}</label>
            <textarea className="form-input" placeholder={ph} value={meta[k]} onChange={e => setMeta(p => ({ ...p, [k]: e.target.value }))} />
          </div>
        ))}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">💭 Reflexão da professora ao final da semana</label>
          <textarea className="form-input" style={{ minHeight: 80 }} placeholder="Como foi a semana? O que te surpreendeu? O que fica para a próxima?" value={meta.reflexao} onChange={e => setMeta(p => ({ ...p, reflexao: e.target.value }))} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={() => showToast('Planejamento salvo!')}>💾 Salvar</button>
        <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📥 Exportar CSV</button>
        <button className="btn btn-ghost btn-sm" onClick={printPlan}>🖨️ Imprimir</button>
      </div>
    </div>
  )
}

export default function Planejamento() {
  const [tab, setTab] = useState('semanal')
  const { showToast } = useApp()

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">📅</span> Planejamento</div>
          <div className="page-subtitle">Organize o cotidiano pedagógico da escola</div>
        </div>
      </div>

      <div className="tabs">
        {['anual', 'trimestral', 'mensal', 'semanal'].map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'semanal' && <PlanSemanal />}

      {tab === 'anual' && (
        <div className="card">
          <div className="card-title">Planejamento Anual 2026</div>
          <div className="form-group">
            <label className="form-label">Eixos de investigação</label>
            <textarea className="form-input" style={{ minHeight: 100 }} placeholder="Ex: Natureza e sustentabilidade, identidade e pertencimento, bichos da escola..." />
          </div>
          <div className="form-group">
            <label className="form-label">Objetivos gerais</label>
            <textarea className="form-input" style={{ minHeight: 80 }} placeholder="Autonomia, cooperação, investigação, expressão..." />
          </div>
          <div className="form-group">
            <label className="form-label">Projetos previstos</label>
            <textarea className="form-input" placeholder="Projetos anuais, eventos, saídas pedagógicas..." />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => showToast('Salvo!')}>💾 Salvar</button>
        </div>
      )}

      {tab === 'trimestral' && (
        <div className="card">
          <div className="card-title">Planejamento Trimestral</div>
          <div className="form-group"><label className="form-label">Nome do projeto</label><input className="form-input" placeholder="Ex: Projeto Pássaros da Escola" /></div>
          <div className="form-group"><label className="form-label">Perguntas norteadoras</label><textarea className="form-input" style={{ minHeight: 80 }} placeholder="Por que os pássaros escolheram nossa escola? O que comem?" /></div>
          <div className="form-group"><label className="form-label">Possíveis caminhos de investigação</label><textarea className="form-input" placeholder="Observação, pesquisa com livros, entrevistas..." /></div>
          <button className="btn btn-primary btn-sm" onClick={() => showToast('Salvo!')}>💾 Salvar</button>
        </div>
      )}

      {tab === 'mensal' && (
        <div className="card">
          <div className="card-title">Planejamento Mensal</div>
          <div className="form-group"><label className="form-label">Tema do mês</label><input className="form-input" placeholder="Ex: Abril — Os pássaros da nossa escola" /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Materiais (naturais)</label><textarea className="form-input" placeholder="Sementes, gravetos, folhas, argila..." /></div>
            <div className="form-group"><label className="form-label">Espaços utilizados</label><textarea className="form-input" placeholder="Horta, ateliê, casinha da árvore, gramado..." /></div>
          </div>
          <div className="form-group"><label className="form-label">Propostas possíveis</label><textarea className="form-input" style={{ minHeight: 80 }} /></div>
          <button className="btn btn-primary btn-sm" onClick={() => showToast('Salvo!')}>💾 Salvar</button>
        </div>
      )}
    </div>
  )
}
