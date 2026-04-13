import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BancoAtividades from './pages/BancoAtividades.jsx'
import PlanejamentoInteligente from './pages/PlanejamentoInteligente.jsx'
import Criancas from './pages/Criancas.jsx'
import Registros from './pages/Registros.jsx'
import Rotina from './pages/Rotina.jsx'
import JornalLiterario from './pages/JornalLiterario.jsx'
import Usuarios from './pages/Usuarios.jsx'
import Ocorrencias from './pages/Ocorrencias.jsx'
import { Inclusao, DiarioFotos, Educadoras, RegistroDiario, Relatorios } from './pages/OtherPages.jsx'
import { Auditoria, ControlePonto } from './pages/AdminPages.jsx'

const LOGO = 'https://static.wixstatic.com/media/69e7d2_ea11d63068d34e6ba1e0d23b8bcee0d8~mv2.jpg/v1/fill/w_100,h_65,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/69e7d2_ea11d63068d34e6ba1e0d23b8bcee0d8~mv2.jpg'

const NAV = [
  { section: 'Principal' },
  { id: 'dashboard', label: 'Início', icon: '🏠' },
  { id: 'registro-diario', label: 'Registro do Dia', icon: '📋', badge: 'NOVO' },
  { section: 'Pedagógico' },
  { id: 'banco-atividades', label: 'Banco de Atividades', icon: '🗂️', badge: 'IA' },
  { id: 'planejamento', label: 'Planejamento', icon: '📅' },
  { id: 'criancas', label: 'Crianças', icon: '🧒' },
  { id: 'registros', label: 'Registros', icon: '📝' },
  { id: 'ocorrencias', label: 'Ocorrências', icon: '⚡' },
  { id: 'inclusao', label: 'Inclusão', icon: '🧠' },
  { section: 'Diário' },
  { id: 'rotina', label: 'Rotina do Dia', icon: '✅' },
  { id: 'fotos', label: 'Diário Fotográfico', icon: '📸' },
  { id: 'jornal', label: 'Jornal Literário', icon: '📰' },
  { section: 'Equipe' },
  { id: 'educadoras', label: 'Educadoras', icon: '👩‍🏫' },
  { id: 'ponto', label: 'Controle de Ponto', icon: '⏱️' },
  { id: 'relatorios', label: 'Relatórios', icon: '📊' },
  { section: 'Administração', adminOnly: true },
  { id: 'usuarios', label: 'Usuários e Acessos', icon: '🔐', adminOnly: true },
  { id: 'auditoria', label: 'Auditoria', icon: '🔍', adminOnly: true },
]

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

function Sidebar({ page, setPage }) {
  const { rotinaCount, dbConnected } = useApp()
  const { user, logout, isAdmin, podeVer } = useAuth()
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
          if (item.section) {
            if (item.adminOnly && !isAdmin) return null
            return <div key={i} className="nav-section">{item.section}</div>
          }
          if (item.adminOnly && !isAdmin) return null
          if (!item.adminOnly && !podeVer(item.id)) return null
          const badgeStyle = item.badge === 'IA' ? { background: '#b8923a', color: '#fff' } : { background: 'var(--terracotta)', color: '#fff' }
          return (
            <button key={item.id} className={`nav-item${page===item.id?' active':''}`} onClick={() => setPage(item.id)}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-badge" style={badgeStyle}>{item.badge}</span>}
              {item.id==='rotina' && rotinaCount>0 && <span className="nav-badge" style={{ background: 'var(--sage)' }}>{rotinaCount}/10</span>}
            </button>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 6, marginBottom: 6, background: dbConnected ? 'rgba(74,124,89,0.2)' : 'rgba(255,255,255,0.05)' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: dbConnected ? '#6aaa7a' : '#888', boxShadow: dbConnected ? '0 0 5px #6aaa7a' : 'none' }} />
          <span style={{ fontSize: 10, color: dbConnected ? '#9fd4a3' : 'rgba(255,255,255,0.3)' }}>{dbConnected ? 'Supabase' : 'Modo local'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.07)', borderRadius: 8, marginBottom: 6, cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 600 }}>
            {user?.nome?.substring(0,1).toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nome}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{user?.grupo}</div>
          </div>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14, padding: 2 }} title="Sair">⏏</button>
        </div>
        <div className="today-pill">
          <div className="tp-label">Hoje</div>
          <div className="tp-day">{DAYS[now.getDay()]}, {now.getDate()} {MONTHS[now.getMonth()]}</div>
        </div>
      </div>
    </aside>
  )
}

function AppInner() {
  const [page, setPage] = useState('dashboard')
  const { toast } = useApp()
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) return <Login />

  const pages = {
    'dashboard': <Dashboard setPage={setPage} />,
    'registro-diario': <RegistroDiario />,
    'banco-atividades': <BancoAtividades onAlocarNoPlanejamento={() => setPage('planejamento')} />,
    'planejamento': <PlanejamentoInteligente />,
    'criancas': <Criancas />,
    'registros': <Registros />,
    'ocorrencias': <Ocorrencias />,
    'inclusao': <Inclusao />,
    'rotina': <Rotina />,
    'fotos': <DiarioFotos />,
    'jornal': <JornalLiterario />,
    'educadoras': <Educadoras />,
    'ponto': <ControlePonto />,
    'relatorios': <Relatorios />,
    'usuarios': <Usuarios />,
    'auditoria': <Auditoria />,
  }

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-content">{pages[page] || pages['dashboard']}</main>
      {toast && <div className="toast"><span>{toast.icon||'✅'}</span><span>{toast.msg}</span></div>}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </AuthProvider>
  )
}
