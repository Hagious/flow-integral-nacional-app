import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import AlertasDiarios from '../components/AlertasDiarios.jsx'

const HUMORES = [
  { id: 'otimo',   emoji: '😄', label: 'Ótima' },
  { id: 'bem',     emoji: '🙂', label: 'Bem' },
  { id: 'normal',  emoji: '😐', label: 'Normal' },
  { id: 'cansada', emoji: '😕', label: 'Cansada' },
  { id: 'triste',  emoji: '😢', label: 'Triste' },
]
const HUMOR_DEFAULT = 'normal'

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_PT = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']

const QUOTES = [
  { text: 'Escutar é uma atitude de abertura ao outro, de reconhecimento do outro.', author: 'Carla Rinaldi' },
  { text: 'A criança é feita de cem. A criança tem cem línguas, cem mãos, cem pensamentos...', author: 'Loris Malaguzzi' },
  { text: 'O ambiente é o terceiro educador.', author: 'Loris Malaguzzi' },
  { text: 'Documentar é tornar visível o processo de aprendizagem.', author: 'Reggio Emilia' },
]

const IDEAS = [
  'Promova uma assembleia das crianças — dê voz às decisões do grupo. A escuta coletiva fortalece o senso de pertencimento.',
  'Ofereça materiais não estruturados (gravetos, sementes, argila) e observe o que as crianças constroem.',
  'Documente uma fala significativa por dia — ao final da semana, você terá um mapa do pensamento da turma.',
  'Organize uma "pesquisa de campo" no pátio: cada criança observa um elemento natural e compartilha com o grupo.',
]

function getAge(nasc) {
  if (!nasc) return null
  const today = new Date()
  const birth = new Date(nasc)
  const nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1)
  const diff = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24))
  return diff
}

export default function Dashboard({ setPage }) {
  const { children, educadoras, rotinaCount, registros } = useApp()
  const { user } = useAuth()
  const now = new Date()
  const h = now.getHours()
  const greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  const dateStr = `${DAYS_PT[now.getDay()]}, ${now.getDate()} de ${MONTHS_PT[now.getMonth()]} de ${now.getFullYear()}`
  const primeiroNome = (user?.nome || '').split(' ')[0]

  const quoteIdx = now.getDate() % QUOTES.length
  const ideaIdx = now.getMonth() % IDEAS.length

  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const humorStorageKey = user ? `integral_humor_${user.id}_${todayKey}` : null
  const [humor, setHumor] = useState(() => {
    if (!humorStorageKey) return HUMOR_DEFAULT
    return localStorage.getItem(humorStorageKey) || null
  })
  const [showHumorModal, setShowHumorModal] = useState(false)

  useEffect(() => {
    if (humorStorageKey && humor === null) setShowHumorModal(true)
  }, [humorStorageKey, humor])

  function escolherHumor(id) {
    const valor = id || HUMOR_DEFAULT
    setHumor(valor)
    if (humorStorageKey) localStorage.setItem(humorStorageKey, valor)
    setShowHumorModal(false)
  }

  const humorAtual = HUMORES.find(h => h.id === (humor || HUMOR_DEFAULT)) || HUMORES[2]

  // Aniversariantes do mês
  const thisMonth = now.getMonth() + 1
  const allPeople = [
    ...children.map(c => ({ ...c, tipo: 'Criança' })),
    ...educadoras.map(e => ({ ...e, tipo: e.tipo })),
  ]
  const bdayPeople = allPeople
    .filter(p => p.nasc && new Date(p.nasc).getMonth() + 1 === thisMonth)
    .map(p => ({ ...p, daysLeft: getAge(p.nasc) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4)

  const weekBars = [7, 9, 6, 8, rotinaCount]

  return (
    <div className="page-wrap">
      {/* Welcome */}
      <div className="welcome-block">
        <div className="welcome-text">
          <h2>{greeting}{primeiroNome ? `, ${primeiroNome}` : ''}! 🌿</h2>
          <p>{dateStr}</p>
          <div style={{ marginTop: 10, fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6, borderLeft: '3px solid var(--gold)', paddingLeft: 12, maxWidth: 620 }}>
            "{QUOTES[quoteIdx].text}"
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 4, fontStyle: 'normal' }}>— {QUOTES[quoteIdx].author}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowHumorModal(true)}
          title={`Humor de hoje: ${humorAtual.label}`}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 56, lineHeight: 1, padding: 0 }}
        >
          {humorAtual.emoji}
        </button>
      </div>

      {showHumorModal && (
        <div className="modal-overlay" onClick={() => escolherHumor(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Como você está se sentindo hoje?</div>
            <p style={{ fontSize: 13, color: 'var(--ink3)', marginTop: -10, marginBottom: 18 }}>
              Não é obrigatório responder. Sua escolha fica registrada apenas para hoje.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              {HUMORES.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => escolherHumor(opt.id)}
                  style={{ flex: '1 1 80px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '14px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                >
                  <span style={{ fontSize: 36, lineHeight: 1 }}>{opt.emoji}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink2)' }}>{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => escolherHumor(null)}>Pular</button>
            </div>
          </div>
        </div>
      )}

      <AlertasDiarios setPage={setPage} />

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-icon green">🧒</div>
          <div><div className="stat-num">{children.length}</div><div className="stat-label">Crianças</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon terra">👩‍🏫</div>
          <div><div className="stat-num">{educadoras.length}</div><div className="stat-label">Educadoras</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">✅</div>
          <div><div className="stat-num">{rotinaCount}/10</div><div className="stat-label">Rotina hoje</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon plum">📝</div>
          <div><div className="stat-num">{registros.length}</div><div className="stat-label">Registros</div></div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 22 }}>
        {/* Birthdays */}
        <div>
          <div style={{ background: 'var(--terra-light)', borderRadius: 'var(--r)', border: '1px solid rgba(196,113,74,0.15)', padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--terracotta)', marginBottom: 10 }}>
              🎂 Aniversariantes — {MONTHS_PT[now.getMonth()]}
            </div>
            {bdayPeople.length === 0 && <div style={{ fontSize: 13, color: 'var(--ink3)' }}>Nenhum aniversário este mês</div>}
            {bdayPeople.map(p => (
              <div key={p.id} className="bday-item">
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: p.cor?.[0] || '#e8f0eb', color: p.cor?.[1] || '#2d5240' }}>
                  {p.nome.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{p.tipo} · {p.nasc?.split('-').reverse().join('/')}</div>
                </div>
                <span className="tag tag-terra" style={{ marginLeft: 'auto', fontSize: 10 }}>
                  {p.daysLeft === 0 ? 'Hoje!' : `Em ${p.daysLeft} dias`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart + Idea */}
        <div>
          <div className="card">
            <div className="card-title">📊 Rotina da semana</div>
            <div className="mini-chart">
              {weekBars.map((v, i) => (
                <div key={i} className="chart-bar" style={{ height: `${v / 10 * 100}%`, background: i === 4 ? 'var(--sage)' : 'var(--sage-mid)' }} />
              ))}
            </div>
            <div className="chart-labels">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map(d => <div key={d} className="chart-label">{d}</div>)}
            </div>
            <hr className="divider" />
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              🌱 Ideia do Mês
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.65 }}>{IDEAS[ideaIdx]}</div>
          </div>
        </div>
      </div>

      {/* Quick access */}
      <div className="sec-title">Acesso Rápido</div>
      <div className="quick-grid">
        <button className="quick-btn" onClick={() => setPage('registro-diario')}>
          <span className="qb-icon">📋</span>
          <span className="qb-title">Registro do Dia</span>
          <span className="qb-sub">Tudo em uma tela</span>
        </button>
        <button className="quick-btn" onClick={() => setPage('planejamento')}>
          <span className="qb-icon">📅</span>
          <span className="qb-title">Planejamento</span>
          <span className="qb-sub">Semana atual</span>
        </button>
        <button className="quick-btn" onClick={() => setPage('jornal')}>
          <span className="qb-icon">📰</span>
          <span className="qb-title">Jornal Literário</span>
          <span className="qb-sub">Montar e imprimir</span>
        </button>
        <button className="quick-btn" onClick={() => setPage('criancas')}>
          <span className="qb-icon">🧒</span>
          <span className="qb-title">Crianças</span>
          <span className="qb-sub">Fichas individuais</span>
        </button>
        <button className="quick-btn" onClick={() => setPage('rotina')}>
          <span className="qb-icon">✅</span>
          <span className="qb-title">Rotina de Hoje</span>
          <span className="qb-sub">{rotinaCount}/10 concluídos</span>
        </button>
        <button className="quick-btn" onClick={() => setPage('educadoras')}>
          <span className="qb-icon">👩‍🏫</span>
          <span className="qb-title">Educadoras</span>
          <span className="qb-sub">Ponto e cadastro</span>
        </button>
      </div>
    </div>
  )
}
