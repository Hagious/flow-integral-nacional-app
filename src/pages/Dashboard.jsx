import { useApp } from '../context/AppContext'
import AlertasDiarios from '../components/AlertasDiarios.jsx'

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
  const now = new Date()
  const h = now.getHours()
  const greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  const dateStr = `${DAYS_PT[now.getDay()]}, ${now.getDate()} de ${MONTHS_PT[now.getMonth()]} de ${now.getFullYear()}`

  const quoteIdx = now.getDate() % QUOTES.length
  const ideaIdx = now.getMonth() % IDEAS.length

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
          <h2>{greeting}! 🌿</h2>
          <p>{dateStr}</p>
        </div>
        <div className="welcome-emoji">🌿</div>
      </div>

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
        {/* Quote + Birthdays */}
        <div>
          <div style={{ background: 'var(--gold-light)', borderRadius: 'var(--r)', border: '1px solid rgba(184,146,58,0.18)', padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 15, color: 'var(--ink2)', lineHeight: 1.65, borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
              "{QUOTES[quoteIdx].text}"
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 8, textAlign: 'right' }}>— {QUOTES[quoteIdx].author}</div>
          </div>

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
