import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const LOGO = 'https://static.wixstatic.com/media/69e7d2_8d11699f56f54ec7b42f3e8464a1fae0~mv2.png/v1/fill/w_980,h_451,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Logo%20preto%20s-f.png'

export default function Login() {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [showSenha, setShowSenha] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    const result = await login(email.trim(), senha)
    if (!result.ok) setErro(result.error)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--warm)', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, background: 'var(--sage-dark)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28
          }}>🌿</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 400, color: 'var(--ink)' }}>Integral</div>
          <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 4 }}>Colégio Nacional · Organização Pedagógica</div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 6 }}>Entrar</div>
          <div style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 24 }}>Acesse com seu email e senha</div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" className="form-input"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required autoFocus
              />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Senha</label>
              <input
                type={showSenha ? 'text' : 'password'} className="form-input"
                value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="••••••••" required
              />
              <button
                type="button" onClick={() => setShowSenha(!showSenha)}
                style={{ position: 'absolute', right: 12, top: 34, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontSize: 13 }}
              >{showSenha ? 'ocultar' : 'mostrar'}</button>
            </div>

            {erro && (
              <div style={{ background: '#fce8e8', border: '1px solid #f09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#791f1f', marginBottom: 16 }}>
                ⚠️ {erro}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px 16px' }} disabled={loading}>
              {loading ? '⏳ Entrando...' : 'Entrar →'}
            </button>
          </form>

          {/* Credenciais de demo */}
          <div style={{ marginTop: 20, padding: 14, background: 'var(--warm)', borderRadius: 8, fontSize: 11 }}>
            <div style={{ fontWeight: 500, color: 'var(--ink3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Acesso demonstração</div>
            {[
              ['admin@integral.com', 'admin123', 'Administrador'],
              ['micheline@integral.com', 'prof123', 'Prof. Referência'],
              ['halyssa@integral.com', 'apoio123', 'Apoio'],
            ].map(([e, s, g]) => (
              <div key={e} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--warm3)', alignItems: 'center' }}>
                <span style={{ color: 'var(--ink2)' }}>{g}</span>
                <button
                  onClick={() => { setEmail(e); setSenha(s) }}
                  style={{ fontSize: 10, color: 'var(--sage)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                >usar →</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--ink4)' }}>
          Colégio Nacional · Educação para Sempre
        </div>
      </div>
    </div>
  )
}
