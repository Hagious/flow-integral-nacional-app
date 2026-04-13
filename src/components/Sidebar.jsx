import { useApp } from '../context/AppContext.jsx'
import { COPYRIGHT, CNPJ, LAST_UPDATE } from '../lib/siteInfo.js'

const NAV = [
  { section: 'Principal' },
  { id: 'dashboard', label: 'Início', icon: '🏠' },
  { id: 'registro-diario', label: 'Registro do Dia', icon: '📋', badge: 'NOVO' },
  { section: 'Pedagógico' },
  { id: 'banco-atividades', label: 'Banco de Atividades', icon: '🗂️', badge: 'IA' },
  { id: 'planejamento', label: 'Planejamento', icon: '📅' },
  { id: 'criancas', label: 'Crianças', icon: '🧒' },
  { id: 'registros', label: 'Registros', icon: '📝' },
  { id: 'inclusao', label: 'Inclusão', icon: '🧠' },
  { section: 'Diário' },
  { id: 'rotina', label: 'Rotina do Dia', icon: '✅' },
  { id: 'fotos', label: 'Diário Fotográfico', icon: '📸' },
  { id: 'jornal', label: 'Jornal Literário', icon: '📰' },
  { section: 'Equipe' },
  { id: 'educadoras', label: 'Educadoras', icon: '👩‍🏫' },
  { id: 'relatorios', label: 'Relatórios', icon: '📊' },
]

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const LOGO = 'https://static.wixstatic.com/media/69e7d2_ea11d63068d34e6ba1e0d23b8bcee0d8~mv2.jpg/v1/fill/w_100,h_65,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/69e7d2_ea11d63068d34e6ba1e0d23b8bcee0d8~mv2.jpg'

export default function Sidebar({ page, setPage }) {
  const { rotinaCount, rotinaTotal, dbConnected, dbMode } = useApp()
  const now = new Date()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-leaf" style={{ overflow: 'hidden' }}>
          <img src={LOGO} alt="CN" style={{ width: 26, height: 26, objectFit: 'cover', borderRadius: '50%' }} onError={e => e.target.style.display='none'} />
        </div>
        <div className="logo-name">Integral</div>
        <div className="logo-sub">Colégio Nacional · Educação para Sempre</div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item, i) => {
          if (item.section) return <div key={i} className="nav-section">{item.section}</div>
          const badgeStyle = item.badge === 'IA'
            ? { background: '#b8923a', color: '#fff' }
            : { background: 'var(--terracotta)', color: '#fff' }
          return (
            <button
              key={item.id}
              className={`nav-item${page === item.id ? ' active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-badge" style={badgeStyle}>{item.badge}</span>}
              {item.id === 'rotina' && rotinaCount > 0 && (
                <span className="nav-badge" style={{ background: 'var(--sage)' }}>{rotinaCount}/{rotinaTotal}</span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        {/* Status do banco de dados */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', borderRadius: 8, marginBottom: 8,
          background: dbConnected ? 'rgba(74,124,89,0.2)' : 'rgba(255,255,255,0.06)'
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: dbConnected ? '#6aaa7a' : '#888',
            boxShadow: dbConnected ? '0 0 6px #6aaa7a' : 'none'
          }} />
          <div style={{ fontSize: 10, color: dbConnected ? '#9fd4a3' : 'rgba(255,255,255,0.35)' }}>
            {dbConnected ? 'Supabase conectado' : 'Modo local (offline)'}
          </div>
        </div>

        <div className="today-pill">
          <div className="tp-label">Hoje</div>
          <div className="tp-day">{DAYS[now.getDay()]}, {now.getDate()} {MONTHS[now.getMonth()]}</div>
        </div>
        <div style={{ marginTop: 10, fontSize: 9, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
          <div>{COPYRIGHT}</div>
          <div>CNPJ {CNPJ}</div>
          <div>Última atualização: {LAST_UPDATE}</div>
        </div>
      </div>
    </aside>
  )
}
