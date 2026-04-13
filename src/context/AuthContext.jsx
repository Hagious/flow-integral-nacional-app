import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

// Módulos e permissões padrão por grupo (fallback sem Supabase)
export const MODULOS = [
  { id: 'dashboard',        nome: 'Início',              icone: '🏠', categoria: 'principal' },
  { id: 'registro-diario',  nome: 'Registro do Dia',     icone: '📋', categoria: 'principal' },
  { id: 'banco-atividades', nome: 'Banco de Atividades', icone: '🗂️', categoria: 'pedagogico' },
  { id: 'planejamento',     nome: 'Planejamento',        icone: '📅', categoria: 'pedagogico' },
  { id: 'criancas',         nome: 'Crianças',            icone: '🧒', categoria: 'pedagogico' },
  { id: 'registros',        nome: 'Registros',           icone: '📝', categoria: 'pedagogico' },
  { id: 'inclusao',         nome: 'Inclusão',            icone: '🧠', categoria: 'pedagogico' },
  { id: 'rotina',           nome: 'Rotina do Dia',       icone: '✅', categoria: 'diario' },
  { id: 'fotos',            nome: 'Diário Fotográfico',  icone: '📸', categoria: 'diario' },
  { id: 'jornal',           nome: 'Jornal Literário',    icone: '📰', categoria: 'diario' },
  { id: 'educadoras',       nome: 'Educadoras',          icone: '👩‍🏫', categoria: 'equipe' },
  { id: 'ponto',            nome: 'Controle de Ponto',   icone: '⏱️', categoria: 'equipe' },
  { id: 'relatorios',       nome: 'Relatórios',          icone: '📊', categoria: 'equipe' },
  { id: 'usuarios',         nome: 'Usuários e Acessos',  icone: '🔐', categoria: 'admin' },
  { id: 'auditoria',        nome: 'Auditoria',           icone: '🔍', categoria: 'admin' },
]

export const GRUPOS_PADRAO = {
  'Administrador': {
    cor: '#2d5240',
    permissoes: Object.fromEntries(MODULOS.map(m => [m.id, { ver: true, criar: true, editar: true, excluir: true }]))
  },
  'Professor Referência': {
    cor: '#4a7c59',
    permissoes: Object.fromEntries(MODULOS.map(m => [m.id, {
      ver: true,
      criar: !['usuarios','auditoria'].includes(m.id),
      editar: !['usuarios','auditoria','ponto'].includes(m.id),
      excluir: ['banco-atividades','planejamento','registros'].includes(m.id)
    }]))
  },
  'Apoio': {
    cor: '#b8923a',
    permissoes: Object.fromEntries(MODULOS.map(m => [m.id, {
      ver: !['usuarios','auditoria'].includes(m.id),
      criar: ['registro-diario','rotina','fotos'].includes(m.id),
      editar: false,
      excluir: false
    }]))
  },
  'RH': {
    cor: '#185fa5',
    permissoes: Object.fromEntries(MODULOS.map(m => [m.id, {
      ver: ['dashboard','educadoras','ponto','relatorios'].includes(m.id),
      criar: false, editar: false, excluir: false
    }]))
  },
  'Coordenadora': {
    cor: '#6b4e71',
    permissoes: Object.fromEntries(MODULOS.map(m => [m.id, {
      ver: !['usuarios','auditoria'].includes(m.id),
      criar: false, editar: false, excluir: false
    }]))
  },
  'Diretora': {
    cor: '#c4714a',
    permissoes: Object.fromEntries(MODULOS.map(m => [m.id, {
      ver: true, criar: false, editar: false, excluir: false
    }]))
  },
}

const SESSION_KEY = 'integral_session'

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

// Admin padrão para desenvolvimento (sem Supabase)
const USUARIOS_DEV = [
  {
    id: 'admin-1', nome: 'Administrador', email: 'admin@integral.com', senha: 'admin123',
    grupo: 'Administrador', is_admin: true, ativo: true,
  },
  {
    id: 'micheline-1', nome: 'Micheline', email: 'micheline@integral.com', senha: 'prof123',
    grupo: 'Professor Referência', is_admin: false, ativo: true,
  },
  {
    id: 'erica-1', nome: 'Érica', email: 'erica@integral.com', senha: 'prof123',
    grupo: 'Professor Referência', is_admin: false, ativo: true,
  },
  {
    id: 'halyssa-1', nome: 'Halyssa', email: 'halyssa@integral.com', senha: 'apoio123',
    grupo: 'Apoio', is_admin: false, ativo: true,
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => lsGet(SESSION_KEY, null))
  const [loading, setLoading] = useState(false)

  const permissoes = useCallback((moduloId) => {
    if (!user) return { ver: false, criar: false, editar: false, excluir: false }
    if (user.is_admin) return { ver: true, criar: true, editar: true, excluir: true }

    // Permissões individuais sobrescrevem o grupo
    if (user.permissoes_individuais?.[moduloId]) {
      return user.permissoes_individuais[moduloId]
    }

    const grupo = GRUPOS_PADRAO[user.grupo]
    return grupo?.permissoes[moduloId] || { ver: false, criar: false, editar: false, excluir: false }
  }, [user])

  const podeVer = useCallback((modulo) => permissoes(modulo).ver, [permissoes])
  const podeCriar = useCallback((modulo) => permissoes(modulo).criar, [permissoes])
  const podeEditar = useCallback((modulo) => permissoes(modulo).editar, [permissoes])
  const podeExcluir = useCallback((modulo) => permissoes(modulo).excluir, [permissoes])

  async function login(email, senha) {
    setLoading(true)
    // Busca em usuários locais (desenvolvimento)
    const usuarios = lsGet('integral_usuarios', USUARIOS_DEV)
    const found = usuarios.find(u => u.email === email && u.senha === senha && u.ativo)
    if (found) {
      const session = { ...found, loginAt: new Date().toISOString() }
      setUser(session)
      lsSet(SESSION_KEY, session)
      registrarAuditoria('login', 'autenticacao', found.id, null, null, found.nome)
      setLoading(false)
      return { ok: true }
    }
    setLoading(false)
    return { ok: false, error: 'Email ou senha incorretos' }
  }

  function logout() {
    if (user) registrarAuditoria('logout', 'autenticacao', user.id, null, null, user.nome)
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      permissoes, podeVer, podeCriar, podeEditar, podeExcluir,
      isAdmin: user?.is_admin || user?.grupo === 'Administrador',
      isLoggedIn: !!user,
      grupoNome: user?.grupo || '',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// ─── Auditoria ───────────────────────────────────────────────
export function registrarAuditoria(acao, modulo, registroId, dadosAntes, dadosDepois, usuarioNome) {
  const logs = lsGet('integral_auditoria', [])
  const entry = {
    id: Date.now().toString(),
    usuario_nome: usuarioNome || lsGet('integral_session', {})?.nome || 'Sistema',
    acao, modulo, registro_id: registroId,
    dados_antes: dadosAntes,
    dados_depois: dadosDepois,
    device_info: navigator.userAgent.substring(0, 100),
    created_at: new Date().toISOString(),
  }
  lsSet('integral_auditoria', [entry, ...logs].slice(0, 500))
  return entry
}
