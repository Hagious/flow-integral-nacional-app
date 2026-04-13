import { useApp } from '../context/AppContext'

const ITEMS = [
  { icon: '🌱', label: 'Horta' },
  { icon: '🐦', label: 'Animais' },
  { icon: '🚿', label: 'Higiene' },
  { icon: '☕', label: 'Café da manhã' },
  { icon: '🍽️', label: 'Almoço' },
  { icon: '📚', label: 'Tarefa de casa' },
  { icon: '🧹', label: 'Organização dos materiais' },
  { icon: '📋', label: 'Agendas e kits' },
  { icon: '🦷', label: 'Escovação' },
  { icon: '🛁', label: 'Banho' },
]

export default function Rotina() {
  const { rotinaState, toggleRotina, rotinaCount } = useApp()
  const pct = rotinaCount / 10 * 100

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">✅</span> Rotina do Dia</div>
          <div className="page-subtitle">Checklist diário — marque o que foi realizado</div>
        </div>
        <input type="date" className="form-input" style={{ width: 'auto' }} defaultValue={new Date().toISOString().split('T')[0]} />
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 20 }}>{rotinaCount} de 10 concluídos</div>
      {ITEMS.map((item, i) => (
        <div key={i} className={`checklist-item${rotinaState[i] ? ' done' : ''}`} onClick={() => toggleRotina(i)}>
          <div className="check-box">
            {rotinaState[i] && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
          </div>
          <span className="ci-icon">{item.icon}</span>
          <span className="ci-label">{item.label}</span>
          {rotinaState[i] && <span className="ci-meta">Concluído</span>}
        </div>
      ))}
    </div>
  )
}
