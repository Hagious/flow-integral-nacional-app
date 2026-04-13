import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// ─── INCLUSAO ────────────────────────────────────────────────
export function Inclusao() {
  const { showToast } = useApp()
  const [obs, setObs] = useState([])
  const [form, setForm] = useState({ nome: '', data: new Date().toISOString().split('T')[0], estrategias: '', adaptacoes: '', respostas: '', proximas: '' })

  function save() {
    if (!form.nome) return
    setObs(p => [{ id: Date.now(), ...form }, ...p])
    showToast('Observação salva!')
    setForm({ nome: '', data: new Date().toISOString().split('T')[0], estrategias: '', adaptacoes: '', respostas: '', proximas: '' })
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div><div className="page-title"><span className="title-icon">🧠</span> Inclusão</div>
        <div className="page-subtitle">TDAH, TEA e necessidades de acompanhamento especial</div></div>
      </div>
      <div className="alert alert-info">ℹ️ Registros qualitativos de estratégias, adaptações e respostas individuais das crianças.</div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="grid-2" style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Nome da criança</label><input className="form-input" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome" /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Data</label><input type="date" className="form-input" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} /></div>
        </div>
        {[['estrategias','✅ Estratégias que funcionaram','O que ajudou? Em que contexto?'],['adaptacoes','✏️ Adaptações feitas','Materiais, espaço, rotina, comunicação...'],['respostas','👁️ Respostas da criança','Como ela respondeu? O que demonstrou?'],['proximas','📌 Próximas estratégias','O que testar nos próximos dias...']].map(([k,l,ph]) => (
          <div className="form-group" key={k}><label className="form-label">{l}</label><textarea className="form-input" placeholder={ph} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
        ))}
        <button className="btn btn-primary btn-sm" onClick={save}>💾 Salvar</button>
      </div>
      {obs.map(o => (
        <div key={o.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontWeight: 500 }}>{o.nome}</div>
            <div style={{ fontSize: 12, color: 'var(--ink3)' }}>📅 {o.data?.split('-').reverse().join('/')}</div>
          </div>
          {o.estrategias && <div style={{ marginBottom: 8 }}><div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', marginBottom: 3 }}>✅ Estratégias</div><div style={{ fontSize: 13 }}>{o.estrategias}</div></div>}
          {o.adaptacoes && <div style={{ marginBottom: 8 }}><div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', marginBottom: 3 }}>✏️ Adaptações</div><div style={{ fontSize: 13 }}>{o.adaptacoes}</div></div>}
          {o.respostas && <div><div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', marginBottom: 3 }}>👁️ Respostas</div><div style={{ fontSize: 13 }}>{o.respostas}</div></div>}
        </div>
      ))}
    </div>
  )
}

// ─── DIÁRIO FOTOGRÁFICO ──────────────────────────────────────
export function DiarioFotos() {
  const { diario, addDiarioEntry, showToast } = useApp()
  const [tab, setTab] = useState('dia')
  const [resumo, setResumo] = useState('')
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div><div className="page-title"><span className="title-icon">📸</span> Diário Fotográfico</div>
        <div className="page-subtitle">Registros visuais e resumos pedagógicos</div></div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => showToast('Resumo gerado com IA! ✨')}>✨ Gerar com IA</button>
          <button className="btn btn-primary btn-sm">+ Adicionar Fotos</button>
        </div>
      </div>
      <div className="tabs">
        {['dia','semana','mês','período'].map(t => (
          <button key={t} className={`tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Resumo do dia — <span style={{ color: 'var(--ink3)' }}>{today.split('-').reverse().join('/')}</span></div>
          <button className="btn btn-ghost btn-xs" onClick={() => showToast('Resumo pedagógico gerado! ✨')}>✨ Gerar com IA</button>
        </div>
        <textarea className="form-input" style={{ minHeight: 80 }} placeholder="Escreva o resumo das atividades do dia, observações importantes, falas das crianças..." value={resumo} onChange={e => setResumo(e.target.value)} />
        <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => { addDiarioEntry({ data: today, resumo }); setResumo('') }}>💾 Salvar</button>
      </div>
      <div className="sec-title">Fotos do dia</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ aspectRatio: '1', background: 'var(--warm2)', borderRadius: 'var(--r2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, cursor: 'pointer', border: '2px dashed var(--warm3)', transition: 'all 0.15s' }}>📷</div>
        ))}
        <div style={{ aspectRatio: '1', background: 'var(--warm)', borderRadius: 'var(--r2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: 'pointer', border: '2px dashed var(--sage-mid)', color: 'var(--sage)', fontWeight: 500 }}>+ Adicionar</div>
      </div>
      {diario.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="sec-title">Registros anteriores</div>
          {diario.map(d => (
            <div key={d.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 6 }}>📅 {d.data?.split('-').reverse().join('/')}</div>
              <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.65 }}>{d.resumo}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── JORNAL LITERÁRIO ────────────────────────────────────────
export function JornalLiterario() {
  const { showToast } = useApp()
  const [atividades, setAtividades] = useState([
    { titulo: '🌿 Assembleia das Crianças', texto: 'As crianças participaram ativamente da votação do nome da turma, discutindo as características de cada pássaro. Surgiram hipóteses riquíssimas sobre os hábitos dos animais e a relação deles com a escola.' },
    { titulo: '🌱 Vivência na Horta', texto: 'Em pequenos grupos, as crianças realizaram a colheita e manutenção dos canteiros, desenvolvendo cooperação, responsabilidade e conexão com a natureza.' },
  ])

  function addAtividade() {
    setAtividades(p => [...p, { titulo: 'Nova atividade', texto: '' }])
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div><div className="page-title"><span className="title-icon">📰</span> Jornal Literário</div>
        <div className="page-subtitle">Publicação mensal com os momentos da turma</div></div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => showToast('Momentos sugeridos com IA! ✨')}>✨ Sugerir Momentos</button>
          <button className="btn btn-ghost btn-sm" onClick={addAtividade}>+ Atividade</button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨️ Imprimir</button>
        </div>
      </div>
      <div className="jornal-preview">
        <div className="jornal-header">
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink3)', marginBottom: 8 }}>Período Integral · Educação Infantil</div>
          <h1>Jornal Literário</h1>
          <p style={{ color: 'var(--ink3)', fontSize: 13, marginTop: 6 }}>Abril de 2026</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <span className="tag tag-green">Turma Bem-te-vi</span>
            <span className="tag tag-terra">12 crianças</span>
          </div>
        </div>
        {atividades.map((a, i) => (
          <div key={i} className="jornal-activity">
            <input
              style={{ background: 'transparent', border: 'none', fontFamily: 'Fraunces, serif', fontSize: 16, color: 'var(--ink)', fontWeight: 500, width: '100%', outline: 'none', marginBottom: 8, display: 'block' }}
              value={a.titulo}
              onChange={e => setAtividades(p => p.map((x, j) => j === i ? { ...x, titulo: e.target.value } : x))}
            />
            <textarea
              style={{ background: 'transparent', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--ink2)', width: '100%', outline: 'none', resize: 'vertical', lineHeight: 1.7, minHeight: 60 }}
              value={a.texto}
              onChange={e => setAtividades(p => p.map((x, j) => j === i ? { ...x, texto: e.target.value } : x))}
              placeholder="Descreva a atividade..."
            />
          </div>
        ))}
        <div
          style={{ textAlign: 'center', padding: '20px', border: '2px dashed var(--warm3)', borderRadius: 'var(--r)', cursor: 'pointer', color: 'var(--ink3)', fontSize: 13 }}
          onClick={addAtividade}
        >
          + Clique para adicionar nova atividade
        </div>
      </div>
    </div>
  )
}

// ─── EDUCADORAS ──────────────────────────────────────────────
export function Educadoras() {
  const { educadoras, addEducadora, updateEducadora, AVATAR_COLORS } = useApp()
  const [tab, setTab] = useState('cadastro')
  const [form, setForm] = useState({ nome: '', tipo: 'Referência', tel: '', nasc: '', obs: '' })

  const MESES_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  function getAge(nasc) {
    if (!nasc) return null
    const today = new Date()
    const birth = new Date(nasc)
    const nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1)
    return Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div><div className="page-title"><span className="title-icon">👩‍🏫</span> Educadoras</div>
        <div className="page-subtitle">Equipe, ponto diário e histórico</div></div>
      </div>
      <div className="tabs">
        {[['cadastro','Cadastro'],['ponto','Ponto Diário'],['historico','Histórico']].map(([t,l]) => (
          <button key={t} className={`tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      {tab === 'cadastro' && (
        <div>
          <div className="edu-grid" style={{ marginBottom: 24 }}>
            {educadoras.map((e, i) => {
              const cor = e.cor || AVATAR_COLORS[i % AVATAR_COLORS.length]
              const daysLeft = getAge(e.nasc)
              return (
                <div key={e.id} className="edu-card">
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: cor[0], color: cor[1], marginBottom: 10 }}>{e.nome.substring(0,2).toUpperCase()}</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{e.nome}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 3, color: e.tipo === 'Referência' ? 'var(--sage)' : 'var(--terracotta)' }}>{e.tipo}</div>
                  {e.nasc && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 4 }}>🎂 {e.nasc.split('-').reverse().join('/')} {daysLeft === 0 ? '· Hoje!' : daysLeft <= 30 ? `· ${daysLeft}d` : ''}</div>}
                  {e.tel && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>📞 {e.tel}</div>}
                </div>
              )
            })}
          </div>
          <hr className="divider" />
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-title">Cadastrar nova educadora</div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Nome completo</label><input className="form-input" value={form.nome} onChange={e => setForm(p=>({...p,nome:e.target.value}))} placeholder="Nome" /></div>
              <div className="form-group"><label className="form-label">Tipo</label><select className="form-input" value={form.tipo} onChange={e => setForm(p=>({...p,tipo:e.target.value}))}><option>Referência</option><option>Apoio</option></select></div>
              <div className="form-group"><label className="form-label">Telefone</label><input className="form-input" value={form.tel} onChange={e => setForm(p=>({...p,tel:e.target.value}))} placeholder="(31) 9..." /></div>
              <div className="form-group"><label className="form-label">Data de nascimento</label><input type="date" className="form-input" value={form.nasc} onChange={e => setForm(p=>({...p,nasc:e.target.value}))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Observações</label><textarea className="form-input" value={form.obs} onChange={e => setForm(p=>({...p,obs:e.target.value}))} placeholder="Especialidade, turno..." /></div>
            <button className="btn btn-primary btn-sm" onClick={() => { if(!form.nome) return; addEducadora(form); setForm({nome:'',tipo:'Referência',tel:'',nasc:'',obs:''})}}>+ Adicionar</button>
          </div>
        </div>
      )}

      {tab === 'ponto' && (
        <div className="card">
          <div className="card-title">Semana de 07 a 11 de Abril de 2026</div>
          {educadoras.map((e, i) => {
            const cor = e.cor || AVATAR_COLORS[i % AVATAR_COLORS.length]
            const pontoKey = `ponto_${e.id}`
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--warm3)' }}>
                <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, background: cor[0], color: cor[1] }}>{e.nome.substring(0,2).toUpperCase()}</div>
                <div style={{ minWidth: 90, fontSize: 13, fontWeight: 500 }}>{e.nome}</div>
                <div className="ponto-grid" style={{ flex: 1 }}>
                  {['Seg','Ter','Qua','Qui','Sex'].map((d, j) => (
                    <PontoCell key={j} day={d} eduId={e.id} dayIdx={j} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'historico' && (
        <div className="card">
          <div className="card-title">Resumo — Abril 2026</div>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--warm3)' }}>
                {['Educadora','Presentes','Faltas','Justificadas'].map(h => (
                  <th key={h} style={{ textAlign: h==='Educadora'?'left':'center', padding: '8px', fontSize: 11, color: 'var(--ink3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {educadoras.map((e, i) => {
                const cor = e.cor || AVATAR_COLORS[i % AVATAR_COLORS.length]
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--warm3)' }}>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar" style={{ width: 26, height: 26, fontSize: 10, background: cor[0], color: cor[1] }}>{e.nome.substring(0,2).toUpperCase()}</div>
                        {e.nome}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px' }}><span className="tag tag-green">16</span></td>
                    <td style={{ textAlign: 'center', padding: '10px 8px' }}><span className="tag tag-terra">1</span></td>
                    <td style={{ textAlign: 'center', padding: '10px 8px' }}><span className="tag tag-gold">0</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function PontoCell({ day, eduId, dayIdx }) {
  const [status, setStatus] = useState('P')
  const cycle = () => setStatus(s => s === 'P' ? 'F' : s === 'F' ? 'J' : 'P')
  const cls = status === 'P' ? 'ponto-p' : status === 'F' ? 'ponto-f' : 'ponto-j'
  return (
    <div className="ponto-day">
      <div className="pd-label">{day}</div>
      <button className={`ponto-btn ${cls}`} onClick={cycle}>{status}</button>
    </div>
  )
}

// ─── REGISTRO DIÁRIO (INTEGRADO) ────────────────────────────
export function RegistroDiario() {
  const { children, rotinaState, toggleRotina, rotinaCount, showToast, educadoras } = useApp()
  const { user } = useAuth()
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [form, setForm] = useState({ atividade: '', como: '', surgiu: '', falas: '', hipoteses: '', situacao: '', reflexao: '' })
  const [selectedChild, setSelectedChild] = useState(null)
  const [obsMap, setObsMap] = useState({}) // { criancaId: { data: texto } }
  const [savedDates, setSavedDates] = useState(() => { try { return JSON.parse(localStorage.getItem('integral_registro_datas') || '[]') } catch { return [] } })

  const ITEMS = ['🌱 Horta','🐦 Animais','🚿 Higiene','☕ Café da manhã','🍽️ Almoço','📚 Tarefa de casa','🧹 Organização','📋 Agendas','🦷 Escovação','🛁 Banho']

  function getObs(criancaId) { return obsMap[criancaId]?.[data] || '' }
  function setObs(criancaId, texto) {
    setObsMap(p => ({ ...p, [criancaId]: { ...(p[criancaId] || {}), [data]: texto } }))
  }

  function save() {
    const entry = { data, form, rotina: rotinaState, observacoes: obsMap, usuario: user?.nome, savedAt: new Date().toISOString() }
    const key = 'integral_registro_' + data
    localStorage.setItem(key, JSON.stringify(entry))
    const datas = [...new Set([...savedDates, data])].sort().reverse()
    localStorage.setItem('integral_registro_datas', JSON.stringify(datas))
    setSavedDates(datas)
    showToast('Registro do dia salvo com sucesso!')
  }

  function loadDate(d) {
    setData(d)
    try {
      const saved = JSON.parse(localStorage.getItem('integral_registro_' + d) || 'null')
      if (saved) { setForm(saved.form || {}); setObsMap(saved.observacoes || {}) }
      else { setForm({ atividade: '', como: '', surgiu: '', falas: '', hipoteses: '', situacao: '', reflexao: '' }); setObsMap({}) }
    } catch {}
  }

  const criancasComObs = children.filter(c => getObs(c.id))

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div><div className="page-title"><span className="title-icon">📋</span> Registro do Dia</div>
        <div className="page-subtitle">Tudo em uma tela — rotina + vozes + observações por criança + reflexão</div></div>
        <div className="header-actions">
          <input type="date" className="form-input" style={{ width: 'auto' }} value={data} onChange={e => loadDate(e.target.value)} />
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>🖨️ Imprimir</button>
          <button className="btn btn-primary btn-sm" onClick={save}>✓ Salvar tudo</button>
        </div>
      </div>

      {/* Datas com registro salvo */}
      {savedDates.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--ink3)', alignSelf: 'center' }}>Registros salvos:</span>
          {savedDates.slice(0, 8).map(d => (
            <button key={d} onClick={() => loadDate(d)} style={{ padding: '3px 10px', borderRadius: 10, fontSize: 11, cursor: 'pointer', border: `1.5px solid ${d === data ? 'var(--sage)' : 'var(--warm3)'}`, background: d === data ? 'var(--sage-light)' : '#fff', color: d === data ? 'var(--sage-dark)' : 'var(--ink3)' }}>
              {d.split('-').reverse().join('/')}
            </button>
          ))}
        </div>
      )}

      <div className="alert alert-info">ℹ️ Planejamento desta semana carregado. Confirme o que foi realizado e adicione observações.</div>
      <div className="grid-2">
        <div>
          <div className="daily-section">
            <div className="daily-section-title">✅ Rotina Realizada <span className="tag tag-green" style={{ marginLeft: 'auto' }}>{rotinaCount}/10</span></div>
            {ITEMS.map((item, i) => (
              <div key={i} className={`checklist-item${rotinaState[i]?' done':''}`} onClick={() => toggleRotina(i)} style={{ marginBottom: 6 }}>
                <div className="check-box">{rotinaState[i] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}</div>
                <span style={{ fontSize: 13 }}>{item}</span>
              </div>
            ))}
          </div>
          <div className="daily-section">
            <div className="daily-section-title">📅 Proposta Realizada</div>
            {[['atividade','Atividade do dia','Ex: Vivência na horta — colheita de alfaces'],['como','Como foi','Descreva a experiência, engajamento, situações...'],['surgiu','O que surgiu de novo','Perguntas, hipóteses, interesses...']].map(([k,l,ph]) => (
              <div className="form-group" key={k}><label className="form-label">{l}</label><textarea className="form-input" placeholder={ph} value={form[k]||''} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} /></div>
            ))}
          </div>
        </div>
        <div>
          <div className="daily-section">
            <div className="daily-section-title">💬 Vozes das Crianças</div>
            {[['falas','💬 Falas significativas','"O pássaro escolheu nossa escola porque tem muita árvore" — Bernardo'],['hipoteses','🔍 Hipóteses levantadas','O que as crianças investigaram...'],['situacao','⭐ Situação mais significativa','Um momento para o jornal ou para as famílias...']].map(([k,l,ph]) => (
              <div className="form-group" key={k}><label className="form-label">{l}</label><textarea className="form-input" placeholder={ph} value={form[k]||''} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} /></div>
            ))}
          </div>

          {/* OBSERVAÇÕES POR CRIANÇA */}
          <div className="daily-section">
            <div className="daily-section-title">
              🧒 Observações por Criança
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink3)' }}>{data.split('-').reverse().join('/')}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {children.map(c => {
                const temObs = !!getObs(c.id)
                return (
                  <button key={c.id}
                    onClick={() => setSelectedChild(selectedChild?.id === c.id ? null : c)}
                    style={{
                      padding: '4px 12px', borderRadius: 14, fontSize: 12, cursor: 'pointer',
                      border: `1.5px solid ${selectedChild?.id === c.id ? 'var(--sage)' : temObs ? 'var(--sage-mid)' : 'var(--warm3)'}`,
                      background: selectedChild?.id === c.id ? 'var(--sage)' : temObs ? 'var(--sage-light)' : '#fff',
                      color: selectedChild?.id === c.id ? '#fff' : temObs ? 'var(--sage-dark)' : 'var(--ink3)',
                      fontWeight: temObs ? 600 : 400,
                      position: 'relative',
                    }}>
                    {c.nome}
                    {temObs && selectedChild?.id !== c.id && <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, background: 'var(--sage)', borderRadius: '50%' }} />}
                  </button>
                )
              })}
              {children.length === 0 && <span style={{ fontSize: 12, color: 'var(--ink4)' }}>Nenhuma criança cadastrada</span>}
            </div>

            {selectedChild && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div className="avatar" style={{ width: 30, height: 30, fontSize: 12, background: selectedChild.cor?.[0]||'#e8f0eb', color: selectedChild.cor?.[1]||'#2d5240' }}>
                    {selectedChild.nome?.substring(0,1).toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{selectedChild.nome}</div>
                  {selectedChild.nasc && <div style={{ fontSize: 11, color: 'var(--ink3)' }}>· {selectedChild.nasc.split('-').reverse().join('/')}</div>}
                </div>
                <textarea
                  className="form-input"
                  style={{ minHeight: 90, borderColor: getObs(selectedChild.id) ? 'var(--sage-mid)' : undefined }}
                  placeholder={`Observações sobre ${selectedChild.nome} em ${data.split('-').reverse().join('/')}...

Ex: Social — demonstrou cooperação durante a montagem do quebra-cabeça
Cognitivo — levantou hipóteses sobre a sombra das árvores`}
                  value={getObs(selectedChild.id)}
                  onChange={e => setObs(selectedChild.id, e.target.value)}
                />
                {getObs(selectedChild.id) && (
                  <div style={{ fontSize: 11, color: 'var(--sage-dark)', marginTop: 4 }}>✓ Observação registrada para {data.split('-').reverse().join('/')}</div>
                )}
              </div>
            )}

            {/* Mini-lista das crianças com obs hoje */}
            {criancasComObs.length > 0 && !selectedChild && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 6 }}>Crianças com observação hoje:</div>
                {criancasComObs.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--warm3)', cursor: 'pointer' }} onClick={() => setSelectedChild(c)}>
                    <div className="avatar" style={{ width: 24, height: 24, fontSize: 10, background: c.cor?.[0]||'#e8f0eb', color: c.cor?.[1]||'#2d5240' }}>{c.nome?.substring(0,1)}</div>
                    <span style={{ fontSize: 12, flex: 1, color: 'var(--ink2)' }}>{c.nome}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink4)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getObs(c.id)}</span>
                    <span style={{ fontSize: 10, color: 'var(--sage)' }}>editar →</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="daily-section">
            <div className="daily-section-title">💭 Reflexão da Educadora</div>
            <textarea className="form-input" placeholder="Como foi o dia? O que ficou para amanhã? O que te surpreendeu?" style={{ minHeight: 90 }} value={form.reflexao||''} onChange={e => setForm(p=>({...p,reflexao:e.target.value}))} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── RELATÓRIOS ──────────────────────────────────────────────
export function Relatorios() {
  const { children, educadoras, registros, rotinaCount } = useApp()
  const weekBars = [8, 9, 7, 10, rotinaCount]

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div><div className="page-title"><span className="title-icon">📊</span> Relatórios</div>
        <div className="page-subtitle">Visão geral do trabalho pedagógico</div></div>
        <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>🖨️ Imprimir</button>
      </div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon green">🧒</div><div><div className="stat-num">{children.length}</div><div className="stat-label">Crianças</div></div></div>
        <div className="stat-card"><div className="stat-icon terra">👩‍🏫</div><div><div className="stat-num">{educadoras.length}</div><div className="stat-label">Educadoras</div></div></div>
        <div className="stat-card"><div className="stat-icon gold">📝</div><div><div className="stat-num">{registros.length}</div><div className="stat-label">Registros</div></div></div>
        <div className="stat-card"><div className="stat-icon plum">✅</div><div><div className="stat-num">{rotinaCount}/10</div><div className="stat-label">Rotina hoje</div></div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">📊 Rotina — Semana atual</div>
          <div className="mini-chart">
            {weekBars.map((v,i) => <div key={i} className="chart-bar" style={{ height: `${v/10*100}%`, background: i===4?'var(--sage)':'var(--sage-mid)' }} />)}
          </div>
          <div className="chart-labels">{['Seg','Ter','Qua','Qui','Sex'].map(d=><div key={d} className="chart-label">{d}</div>)}</div>
        </div>
        <div className="card">
          <div className="card-title">👩‍🏫 Educadoras — Presença</div>
          {educadoras.map((e, i) => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, background: (e.cor||['#e8f0eb','#2d5240'])[0], color: (e.cor||['#e8f0eb','#2d5240'])[1] }}>{e.nome.substring(0,2).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12 }}>{e.nome}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink3)' }}>95%</span>
                </div>
                <div className="progress-bar" style={{ marginBottom: 0 }}><div className="progress-fill" style={{ width: '95%' }} /></div>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title">🧒 Registros por criança</div>
          {children.length === 0 ? <div style={{ fontSize: 13, color: 'var(--ink3)' }}>Nenhuma criança cadastrada</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {children.map(c => (
                <div key={c.id} style={{ background: 'var(--warm)', borderRadius: 'var(--r2)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: c.cor[0], color: c.cor[1] }}>{c.nome.substring(0,1).toUpperCase()}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.nome}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink3)' }}>{c.obs?.length || 0} observações</div>
                  <div className="progress-bar" style={{ marginTop: 6, marginBottom: 0 }}><div className="progress-fill" style={{ width: `${Math.min((c.obs?.length||0)*20, 100)}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
