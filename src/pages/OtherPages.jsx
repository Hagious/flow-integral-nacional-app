import { useState, useMemo, Fragment } from 'react'
import ShareExportModal from '../components/ShareExportModal.jsx'
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
  const [shareOpen, setShareOpen] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const textoShare = diario.length === 0
    ? `Resumo do dia ${today.split('-').reverse().join('/')}\n\n${resumo || '(sem resumo)'}`
    : diario.slice(0, 10).map(d => `📅 ${d.data?.split('-').reverse().join('/')}\n${d.resumo || ''}`).join('\n\n───\n\n')

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div><div className="page-title"><span className="title-icon">📸</span> Diário Fotográfico</div>
        <div className="page-subtitle">Registros visuais e resumos pedagógicos</div></div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => showToast('Resumo gerado com IA! ✨')}>✨ Gerar com IA</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShareOpen(true)}>📤 Compartilhar</button>
          <button className="btn btn-primary btn-sm">+ Adicionar Fotos</button>
        </div>
      </div>
      <ShareExportModal
        aberto={shareOpen}
        onClose={() => setShareOpen(false)}
        titulo="Diário Fotográfico"
        subtitulo={`${diario.length} registro(s)`}
        conteudoTexto={textoShare}
        linkRelativo="Diário Fotográfico"
      />
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
  const [shareOpen, setShareOpen] = useState(false)
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
          <button className="btn btn-ghost btn-sm" onClick={() => setShareOpen(true)}>📤 Compartilhar</button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨️ Imprimir</button>
        </div>
      </div>
      <ShareExportModal
        aberto={shareOpen}
        onClose={() => setShareOpen(false)}
        titulo="Jornal Literário"
        subtitulo={`${atividades.length} atividade(s)`}
        conteudoTexto={atividades.map(a => `${a.titulo}\n${a.texto}`).join('\n\n───\n\n')}
        linkRelativo="Jornal Literário"
      />
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
// ─── Ponto helpers ────────────────────────────────────────────
function lsGetOP(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
function lsSetOP(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
function pontoGetAll() { return lsGetOP('integral_ponto', {}) }
function pontoSetAll(dados) { lsSetOP('integral_ponto', dados) }
function pontoGet(eduId, date) {
  const all = pontoGetAll()
  return all[eduId]?.[date] || null
}
function pontoSet(eduId, date, status, motivo = '') {
  const all = pontoGetAll()
  if (!all[eduId]) all[eduId] = {}
  if (status === null) delete all[eduId][date]
  else all[eduId][date] = { status, motivo }
  pontoSetAll(all)
}
function rangeDates(inicio, fim, semFimDeSemana = true) {
  const out = []
  if (!inicio || !fim) return out
  const d = new Date(inicio + 'T12:00')
  const f = new Date(fim + 'T12:00')
  if (d > f) return out
  while (d <= f) {
    const dow = d.getDay()
    if (!semFimDeSemana || (dow !== 0 && dow !== 6)) {
      out.push(d.toISOString().split('T')[0])
    }
    d.setDate(d.getDate() + 1)
  }
  return out
}
function inicioDaSemana() {
  const d = new Date()
  const dow = d.getDay()
  const delta = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + delta)
  return d.toISOString().split('T')[0]
}
function fimDaSemana() {
  const d = new Date(inicioDaSemana() + 'T12:00')
  d.setDate(d.getDate() + 4)
  return d.toISOString().split('T')[0]
}
const DOW_CURTO = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const EDU_FORM_INICIAL = {
  nome: '', tipo: 'Referência', tel: '', email: '', nasc: '', obs: '',
  data_contratacao: '', horario_inicio: '07:30', horario_fim: '13:30',
  horarios_variacoes: [], // [{ dia: 5, inicio: '08:00', fim: '14:00' }]
  horarios_excecoes: [],  // [{ data: '2026-04-15', inicio: '09:00', fim: '12:00', motivo: '' }]
  hobbies: '', interesses: '', bio: '',
}

const DIAS_SEMANA_FULL = [
  { id: 1, curto: 'Seg', full: 'Segunda-feira' },
  { id: 2, curto: 'Ter', full: 'Terça-feira' },
  { id: 3, curto: 'Qua', full: 'Quarta-feira' },
  { id: 4, curto: 'Qui', full: 'Quinta-feira' },
  { id: 5, curto: 'Sex', full: 'Sexta-feira' },
]

function ScheduleEditor({ data, onChange }) {
  const variacoes = data.horarios_variacoes || []
  const excecoes = data.horarios_excecoes || []
  const diasUsados = new Set(variacoes.map(v => v.dia))
  const diasDisponiveis = DIAS_SEMANA_FULL.filter(d => !diasUsados.has(d.id))

  const up = (patch) => onChange({ ...data, ...patch })

  return (
    <div>
      <div className="grid-2">
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Horário padrão</label>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="time" className="form-input" value={data.horario_inicio || ''} onChange={e => up({ horario_inicio: e.target.value })} />
            <span style={{ fontSize: 12, color: 'var(--ink3)' }}>às</span>
            <input type="time" className="form-input" value={data.horario_fim || ''} onChange={e => up({ horario_fim: e.target.value })} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink4)', marginTop: 4 }}>Usado nos dias sem variação definida</div>
        </div>
      </div>

      {/* Variações por dia da semana */}
      <div style={{ marginTop: 10, background: 'var(--warm)', borderRadius: 8, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2)' }}>📅 Variações fixas por dia da semana</div>
          {diasDisponiveis.length > 0 && (
            <select className="form-input" style={{ fontSize: 11, width: 160 }} value="" onChange={e => {
              if (!e.target.value) return
              const novo = { dia: Number(e.target.value), inicio: data.horario_inicio || '07:30', fim: data.horario_fim || '13:30' }
              up({ horarios_variacoes: [...variacoes, novo].sort((a, b) => a.dia - b.dia) })
            }}>
              <option value="">+ adicionar dia</option>
              {diasDisponiveis.map(d => <option key={d.id} value={d.id}>{d.full}</option>)}
            </select>
          )}
        </div>
        {variacoes.length === 0 && <div style={{ fontSize: 11, color: 'var(--ink4)', fontStyle: 'italic' }}>Nenhuma variação — o horário padrão vale para todos os dias.</div>}
        {variacoes.map((v, i) => (
          <div key={v.dia} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ minWidth: 120, fontSize: 12, fontWeight: 500, color: 'var(--ink2)' }}>{DIAS_SEMANA_FULL.find(d => d.id === v.dia)?.full}</div>
            <input type="time" className="form-input" style={{ width: 110 }} value={v.inicio} onChange={e => up({ horarios_variacoes: variacoes.map((x, j) => j === i ? { ...x, inicio: e.target.value } : x) })} />
            <span style={{ fontSize: 12, color: 'var(--ink3)' }}>às</span>
            <input type="time" className="form-input" style={{ width: 110 }} value={v.fim} onChange={e => up({ horarios_variacoes: variacoes.map((x, j) => j === i ? { ...x, fim: e.target.value } : x) })} />
            <button className="btn btn-ghost btn-xs" onClick={() => up({ horarios_variacoes: variacoes.filter((_, j) => j !== i) })}>Remover</button>
          </div>
        ))}
      </div>

      {/* Exceções pontuais */}
      <div style={{ marginTop: 10, background: 'var(--warm)', borderRadius: 8, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2)' }}>⚠️ Exceções em datas específicas</div>
          <button className="btn btn-ghost btn-xs" onClick={() => up({ horarios_excecoes: [...excecoes, { data: '', inicio: data.horario_inicio || '07:30', fim: data.horario_fim || '13:30', motivo: '' }] })}>
            + adicionar data
          </button>
        </div>
        {excecoes.length === 0 && <div style={{ fontSize: 11, color: 'var(--ink4)', fontStyle: 'italic' }}>Nenhuma exceção pontual.</div>}
        {excecoes.map((ex, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <input type="date" className="form-input" style={{ width: 140 }} value={ex.data} onChange={e => up({ horarios_excecoes: excecoes.map((x, j) => j === i ? { ...x, data: e.target.value } : x) })} />
            <input type="time" className="form-input" style={{ width: 100 }} value={ex.inicio} onChange={e => up({ horarios_excecoes: excecoes.map((x, j) => j === i ? { ...x, inicio: e.target.value } : x) })} />
            <span style={{ fontSize: 12, color: 'var(--ink3)' }}>às</span>
            <input type="time" className="form-input" style={{ width: 100 }} value={ex.fim} onChange={e => up({ horarios_excecoes: excecoes.map((x, j) => j === i ? { ...x, fim: e.target.value } : x) })} />
            <input className="form-input" style={{ flex: 1, minWidth: 140 }} placeholder="motivo (opcional)" value={ex.motivo} onChange={e => up({ horarios_excecoes: excecoes.map((x, j) => j === i ? { ...x, motivo: e.target.value } : x) })} />
            <button className="btn btn-ghost btn-xs" onClick={() => up({ horarios_excecoes: excecoes.filter((_, j) => j !== i) })}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function resumoHorarios(edu) {
  if (!edu.horario_inicio && !edu.horario_fim) return null
  const v = edu.horarios_variacoes || []
  if (v.length === 0) return `${edu.horario_inicio || '—'} às ${edu.horario_fim || '—'}`
  return `Padrão ${edu.horario_inicio || '—'}–${edu.horario_fim || '—'} · ${v.length} variação${v.length > 1 ? 'es' : ''}`
}

export function Educadoras() {
  const { educadoras, addEducadora, updateEducadora, AVATAR_COLORS, showToast } = useApp()
  const [tab, setTab] = useState('cadastro')
  const [form, setForm] = useState(EDU_FORM_INICIAL)
  const [editando, setEditando] = useState(null)
  const [periodoIni, setPeriodoIni] = useState(inicioDaSemana)
  const [periodoFim, setPeriodoFim] = useState(fimDaSemana)
  const [mesHistorico, setMesHistorico] = useState(() => new Date().toISOString().slice(0, 7))
  const [expandidoHist, setExpandidoHist] = useState(null)
  const [pontoTick, setPontoTick] = useState(0) // força re-render ao atualizar ponto

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
                <div key={e.id} className="edu-card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setEditando({ ...EDU_FORM_INICIAL, ...e })}>
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: cor[0], color: cor[1], marginBottom: 10 }}>{e.nome.substring(0,2).toUpperCase()}</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{e.nome}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 3, color: e.tipo === 'Referência' ? 'var(--sage)' : 'var(--terracotta)' }}>{e.tipo}</div>
                  {resumoHorarios(e) && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 4 }}>⏱️ {resumoHorarios(e)}</div>}
                  {e.data_contratacao && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>📝 Desde {e.data_contratacao.split('-').reverse().join('/')}</div>}
                  {e.nasc && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>🎂 {e.nasc.split('-').reverse().join('/')} {daysLeft === 0 ? '· Hoje!' : daysLeft <= 30 ? `· ${daysLeft}d` : ''}</div>}
                  {e.tel && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>📞 {e.tel}</div>}
                  <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 11, color: 'var(--ink4)' }}>✏️</div>
                </div>
              )
            })}
          </div>
          <hr className="divider" />
          <div className="card" style={{ maxWidth: 720 }}>
            <div className="card-title">Cadastrar nova educadora</div>

            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Dados profissionais</div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Nome completo *</label><input className="form-input" value={form.nome} onChange={e => setForm(p=>({...p,nome:e.target.value}))} placeholder="Nome" /></div>
              <div className="form-group"><label className="form-label">Tipo</label><select className="form-input" value={form.tipo} onChange={e => setForm(p=>({...p,tipo:e.target.value}))}><option>Referência</option><option>Apoio</option></select></div>
              <div className="form-group"><label className="form-label">Data de contratação</label><input type="date" className="form-input" value={form.data_contratacao} onChange={e => setForm(p=>({...p,data_contratacao:e.target.value}))} /></div>
            </div>
            <div style={{ marginTop: 8, marginBottom: 12 }}>
              <ScheduleEditor data={form} onChange={novo => setForm(novo)} />
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 12, marginBottom: 8 }}>Contato & pessoal</div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Telefone</label><input className="form-input" value={form.tel} onChange={e => setForm(p=>({...p,tel:e.target.value}))} placeholder="(31) 9..." /></div>
              <div className="form-group"><label className="form-label">E-mail</label><input className="form-input" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="nome@..." /></div>
              <div className="form-group"><label className="form-label">Data de nascimento</label><input type="date" className="form-input" value={form.nasc} onChange={e => setForm(p=>({...p,nasc:e.target.value}))} /></div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 12, marginBottom: 4 }}>
              💜 Para nos conhecermos melhor <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink4)', fontSize: 10 }}>(opcional)</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink4)', marginBottom: 8 }}>
              Informações leves para fortalecer a comunicação entre a equipe.
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Hobbies</label><input className="form-input" value={form.hobbies} onChange={e => setForm(p=>({...p,hobbies:e.target.value}))} placeholder="Ex: jardinagem, crochê, caminhada..." /></div>
              <div className="form-group"><label className="form-label">O que gosta de fazer nas horas vagas</label><input className="form-input" value={form.interesses} onChange={e => setForm(p=>({...p,interesses:e.target.value}))} placeholder="Ex: assistir séries, cozinhar, viajar..." /></div>
            </div>
            <div className="form-group"><label className="form-label">Um pouco sobre mim</label><textarea className="form-input" style={{ minHeight: 60 }} value={form.bio} onChange={e => setForm(p=>({...p,bio:e.target.value}))} placeholder="Conte rapidamente o que quiser compartilhar com a equipe" /></div>

            <div className="form-group"><label className="form-label">Observações</label><textarea className="form-input" value={form.obs} onChange={e => setForm(p=>({...p,obs:e.target.value}))} placeholder="Especialidade, turno..." /></div>
            <button className="btn btn-primary btn-sm" onClick={() => { if(!form.nome) return; addEducadora(form); setForm(EDU_FORM_INICIAL); showToast('Educadora cadastrada') }}>+ Adicionar</button>
          </div>

          {/* Modal de edição */}
          {editando && (
            <div className="modal-overlay" onClick={() => setEditando(null)}>
              <div className="modal" style={{ maxWidth: 720 }} onClick={ev => ev.stopPropagation()}>
                <div className="modal-title">✏️ Editar — {editando.nome}</div>

                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Dados profissionais</div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Nome completo</label><input className="form-input" value={editando.nome} onChange={e => setEditando(p => ({ ...p, nome: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Tipo</label><select className="form-input" value={editando.tipo} onChange={e => setEditando(p => ({ ...p, tipo: e.target.value }))}><option>Referência</option><option>Apoio</option></select></div>
                  <div className="form-group"><label className="form-label">Data de contratação</label><input type="date" className="form-input" value={editando.data_contratacao || ''} onChange={e => setEditando(p => ({ ...p, data_contratacao: e.target.value }))} /></div>
                </div>
                <div style={{ marginTop: 8, marginBottom: 12 }}>
                  <ScheduleEditor data={editando} onChange={novo => setEditando(novo)} />
                </div>

                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 12, marginBottom: 8 }}>Contato & pessoal</div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Telefone</label><input className="form-input" value={editando.tel || ''} onChange={e => setEditando(p => ({ ...p, tel: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">E-mail</label><input className="form-input" value={editando.email || ''} onChange={e => setEditando(p => ({ ...p, email: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Data de nascimento</label><input type="date" className="form-input" value={editando.nasc || ''} onChange={e => setEditando(p => ({ ...p, nasc: e.target.value }))} /></div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 12, marginBottom: 4 }}>
                  💜 Para nos conhecermos melhor <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink4)', fontSize: 10 }}>(opcional)</span>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Hobbies</label><input className="form-input" value={editando.hobbies || ''} onChange={e => setEditando(p => ({ ...p, hobbies: e.target.value }))} placeholder="Ex: jardinagem, crochê..." /></div>
                  <div className="form-group"><label className="form-label">Horas vagas</label><input className="form-input" value={editando.interesses || ''} onChange={e => setEditando(p => ({ ...p, interesses: e.target.value }))} placeholder="O que gosta de fazer" /></div>
                </div>
                <div className="form-group"><label className="form-label">Um pouco sobre mim</label><textarea className="form-input" style={{ minHeight: 60 }} value={editando.bio || ''} onChange={e => setEditando(p => ({ ...p, bio: e.target.value }))} /></div>

                <div className="form-group"><label className="form-label">Observações</label><textarea className="form-input" value={editando.obs || ''} onChange={e => setEditando(p => ({ ...p, obs: e.target.value }))} /></div>

                <div className="modal-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditando(null)}>Cancelar</button>
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    updateEducadora(editando.id, editando)
                    showToast('Educadora atualizada')
                    setEditando(null)
                  }}>💾 Salvar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'ponto' && (() => {
        const datas = rangeDates(periodoIni, periodoFim, true)
        return (
          <div className="card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Período inicial</label>
                <input type="date" className="form-input" value={periodoIni} onChange={e => setPeriodoIni(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Período final</label>
                <input type="date" className="form-input" value={periodoFim} onChange={e => setPeriodoFim(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-xs" onClick={() => { setPeriodoIni(inicioDaSemana()); setPeriodoFim(fimDaSemana()) }}>Semana atual</button>
                <button className="btn btn-ghost btn-xs" onClick={() => {
                  const d = new Date(); const ini = new Date(d.getFullYear(), d.getMonth(), 1); const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0)
                  setPeriodoIni(ini.toISOString().split('T')[0]); setPeriodoFim(fim.toISOString().split('T')[0])
                }}>Mês atual</button>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink4)' }}>
                Clique em uma célula para alternar P → F → J. Para F/J será pedido o motivo.
              </div>
            </div>

            {datas.length === 0 && <div style={{ padding: 20, fontSize: 13, color: 'var(--ink4)', textAlign: 'center' }}>Selecione um período válido.</div>}

            {datas.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, color: 'var(--ink3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', position: 'sticky', left: 0, background: '#fff', minWidth: 140 }}>Educadora</th>
                      {datas.map(d => {
                        const dt = new Date(d + 'T12:00')
                        return (
                          <th key={d} style={{ textAlign: 'center', padding: '6px 4px', fontSize: 10, color: 'var(--ink3)', fontWeight: 500, minWidth: 54 }}>
                            <div>{DOW_CURTO[dt.getDay()]}</div>
                            <div style={{ color: 'var(--ink4)', fontSize: 9 }}>{dt.getDate()}/{dt.getMonth() + 1}</div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {educadoras.map((e, i) => {
                      const cor = e.cor || AVATAR_COLORS[i % AVATAR_COLORS.length]
                      return (
                        <tr key={e.id} style={{ borderTop: '1px solid var(--warm3)' }}>
                          <td style={{ padding: '8px', position: 'sticky', left: 0, background: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="avatar" style={{ width: 26, height: 26, fontSize: 10, background: cor[0], color: cor[1] }}>{e.nome.substring(0, 2).toUpperCase()}</div>
                              <span style={{ fontSize: 12, fontWeight: 500 }}>{e.nome}</span>
                            </div>
                          </td>
                          {datas.map(d => (
                            <td key={d} style={{ textAlign: 'center', padding: '6px 4px' }}>
                              <PontoCell eduId={e.id} date={d} tick={pontoTick} onChange={() => setPontoTick(t => t + 1)} />
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ fontSize: 10, color: 'var(--ink4)', marginTop: 12, display: 'flex', gap: 12 }}>
              <span><span className="ponto-btn ponto-p" style={{ fontSize: 9, padding: '1px 6px' }}>P</span> Presente</span>
              <span><span className="ponto-btn ponto-f" style={{ fontSize: 9, padding: '1px 6px' }}>F</span> Falta</span>
              <span><span className="ponto-btn ponto-j" style={{ fontSize: 9, padding: '1px 6px' }}>J</span> Justificada</span>
            </div>
          </div>
        )
      })()}

      {tab === 'historico' && (() => {
        const [ano, mes] = mesHistorico.split('-').map(Number)
        const primeiro = new Date(ano, mes - 1, 1)
        const ultimo = new Date(ano, mes, 0)
        const datasDoMes = rangeDates(primeiro.toISOString().split('T')[0], ultimo.toISOString().split('T')[0], true)
        const tudo = pontoGetAll()
        const resumo = educadoras.map(e => {
          const reg = tudo[e.id] || {}
          const ocorrencias = datasDoMes.map(d => ({ date: d, ...(reg[d] || { status: 'P', motivo: '' }) }))
          const faltas = ocorrencias.filter(o => o.status === 'F')
          const justificadas = ocorrencias.filter(o => o.status === 'J')
          const presentes = ocorrencias.filter(o => o.status === 'P')
          return { edu: e, faltas, justificadas, presentes, total: datasDoMes.length }
        })
        const MESES_LONGOS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

        return (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Mês</label>
                <input type="month" className="form-input" value={mesHistorico} onChange={e => setMesHistorico(e.target.value)} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink2)' }}>
                Resumo — {MESES_LONGOS[mes - 1]} {ano} <span style={{ fontSize: 11, color: 'var(--ink4)' }}>({datasDoMes.length} dias úteis)</span>
              </div>
            </div>

            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--warm3)' }}>
                  {['Educadora','Presentes','Faltas','Justificadas',''].map((h, idx) => (
                    <th key={idx} style={{ textAlign: h === 'Educadora' ? 'left' : 'center', padding: '8px', fontSize: 11, color: 'var(--ink3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resumo.map(({ edu: e, faltas, justificadas, presentes }, i) => {
                  const cor = e.cor || AVATAR_COLORS[i % AVATAR_COLORS.length]
                  const temDetalhe = faltas.length > 0 || justificadas.length > 0
                  const aberto = expandidoHist === e.id
                  return (
                    <Fragment key={e.id}>
                      <tr style={{ borderBottom: aberto ? 'none' : '1px solid var(--warm3)', cursor: temDetalhe ? 'pointer' : 'default' }}
                        onClick={() => { if (temDetalhe) setExpandidoHist(aberto ? null : e.id) }}>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="avatar" style={{ width: 26, height: 26, fontSize: 10, background: cor[0], color: cor[1] }}>{e.nome.substring(0,2).toUpperCase()}</div>
                            {e.nome}
                            {temDetalhe && <span style={{ fontSize: 11, color: 'var(--ink4)' }}>{aberto ? '⌃' : '⌄'}</span>}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '10px 8px' }}><span className="tag tag-green">{presentes.length}</span></td>
                        <td style={{ textAlign: 'center', padding: '10px 8px' }}>{faltas.length > 0 ? <span className="tag tag-terra">{faltas.length}</span> : <span style={{ color: 'var(--ink4)', fontSize: 12 }}>—</span>}</td>
                        <td style={{ textAlign: 'center', padding: '10px 8px' }}>{justificadas.length > 0 ? <span className="tag tag-gold">{justificadas.length}</span> : <span style={{ color: 'var(--ink4)', fontSize: 12 }}>—</span>}</td>
                        <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: 11, color: 'var(--ink4)' }}>
                          {temDetalhe ? 'ver detalhes' : ''}
                        </td>
                      </tr>
                      {aberto && temDetalhe && (
                        <tr key={e.id + '-det'} style={{ borderBottom: '1px solid var(--warm3)', background: 'var(--warm)' }}>
                          <td colSpan={5} style={{ padding: '12px 16px' }}>
                            {faltas.length > 0 && (
                              <div style={{ marginBottom: justificadas.length > 0 ? 12 : 0 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#791f1f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Faltas ({faltas.length})</div>
                                {faltas.map(f => (
                                  <div key={f.date} style={{ fontSize: 12, color: 'var(--ink2)', padding: '4px 0', display: 'flex', gap: 10 }}>
                                    <span style={{ minWidth: 80, color: 'var(--ink3)' }}>📅 {f.date.split('-').reverse().join('/')}</span>
                                    <span>{f.motivo || <em style={{ color: 'var(--ink4)' }}>Sem motivo registrado</em>}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {justificadas.length > 0 && (
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#633806', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Justificadas ({justificadas.length})</div>
                                {justificadas.map(j => (
                                  <div key={j.date} style={{ fontSize: 12, color: 'var(--ink2)', padding: '4px 0', display: 'flex', gap: 10 }}>
                                    <span style={{ minWidth: 80, color: 'var(--ink3)' }}>📅 {j.date.split('-').reverse().join('/')}</span>
                                    <span>{j.motivo || <em style={{ color: 'var(--ink4)' }}>Sem motivo registrado</em>}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })()}
    </div>
  )
}

function PontoCell({ eduId, date, tick, onChange }) {
  const registro = pontoGet(eduId, date) // { status, motivo } | null
  const status = registro?.status || 'P'
  const cls = status === 'P' ? 'ponto-p' : status === 'F' ? 'ponto-f' : 'ponto-j'

  function cycle() {
    const next = status === 'P' ? 'F' : status === 'F' ? 'J' : 'P'
    let motivo = registro?.motivo || ''
    if (next === 'F' || next === 'J') {
      const msg = next === 'F' ? 'Motivo da falta (opcional):' : 'Justificativa:'
      const input = window.prompt(msg, motivo)
      if (input !== null) motivo = input
    } else {
      motivo = ''
    }
    pontoSet(eduId, date, next, motivo)
    onChange?.()
  }

  const title = (status === 'F' || status === 'J') && registro?.motivo ? registro.motivo : date.split('-').reverse().join('/')
  return (
    <button className={`ponto-btn ${cls}`} onClick={cycle} title={title} data-tick={tick}>{status}</button>
  )
}

// ─── REGISTRO DIÁRIO (INTEGRADO) ────────────────────────────
export function RegistroDiario() {
  const { children, rotinaItemsHoje, rotinaCheck, toggleRotina, rotinaCount, rotinaTotal, showToast, educadoras } = useApp()
  const { user } = useAuth()
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [form, setForm] = useState({ atividade: '', como: '', surgiu: '', falas: '', hipoteses: '', situacao: '', reflexao: '' })
  const [selectedChild, setSelectedChild] = useState(null)
  const [obsMap, setObsMap] = useState({}) // { criancaId: { data: texto } }
  const [savedDates, setSavedDates] = useState(() => { try { return JSON.parse(localStorage.getItem('integral_registro_datas') || '[]') } catch { return [] } })
  const [shareOpen, setShareOpen] = useState(false)
  const [shareIni, setShareIni] = useState('')
  const [shareFim, setShareFim] = useState('')

  function getObs(criancaId) { return obsMap[criancaId]?.[data] || '' }
  function setObs(criancaId, texto) {
    setObsMap(p => ({ ...p, [criancaId]: { ...(p[criancaId] || {}), [data]: texto } }))
  }

  function save() {
    const entry = { data, form, rotina: rotinaCheck, observacoes: obsMap, usuario: user?.nome, savedAt: new Date().toISOString() }
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
          <button className="btn btn-ghost btn-sm" onClick={() => { setShareIni(data); setShareFim(data); setShareOpen(true) }}>📤 Compartilhar</button>
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
            <div className="daily-section-title">✅ Rotina Realizada <span className="tag tag-green" style={{ marginLeft: 'auto' }}>{rotinaCount}/{rotinaTotal}</span></div>
            {rotinaItemsHoje.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--ink4)', fontStyle: 'italic', padding: 8 }}>Nenhum item configurado para hoje. Configure em Rotina do Dia.</div>
            )}
            {rotinaItemsHoje.map(item => {
              const done = !!rotinaCheck[item.id]
              return (
                <div key={item.id} className={`checklist-item${done?' done':''}`} onClick={() => toggleRotina(item.id)} style={{ marginBottom: 6 }}>
                  <div className="check-box">{done && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}</div>
                  <span style={{ fontSize: 13 }}>{item.icon} {item.label}</span>
                </div>
              )
            })}
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

      {shareOpen && (() => {
        // Coleta registros do período
        const datasNoRange = []
        const ini = shareIni || data
        const fim = shareFim || shareIni || data
        const d0 = new Date(ini + 'T12:00'); const d1 = new Date(fim + 'T12:00')
        while (d0 <= d1) { datasNoRange.push(d0.toISOString().split('T')[0]); d0.setDate(d0.getDate() + 1) }
        const entradas = datasNoRange.map(d => {
          const saved = (() => { try { return JSON.parse(localStorage.getItem('integral_registro_' + d) || 'null') } catch { return null } })()
          return { data: d, saved }
        }).filter(x => x.saved)
        const txt = entradas.length === 0 ? 'Nenhum registro salvo no período.' : entradas.map(({ data: d, saved }) => {
          const f = saved.form || {}
          return [
            `📅 ${d.split('-').reverse().join('/')}`,
            f.atividade && `Atividade: ${f.atividade}`,
            f.como && `Como foi: ${f.como}`,
            f.surgiu && `Surgiu: ${f.surgiu}`,
            f.falas && `Falas: ${f.falas}`,
            f.hipoteses && `Hipóteses: ${f.hipoteses}`,
            f.situacao && `Situação: ${f.situacao}`,
            f.reflexao && `Reflexão: ${f.reflexao}`,
          ].filter(Boolean).join('\n')
        }).join('\n\n───\n\n')
        const htmlPreview = (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input type="date" className="form-input" style={{ width: 140 }} value={shareIni} onChange={e => setShareIni(e.target.value)} />
              <span style={{ alignSelf: 'center', fontSize: 11, color: 'var(--ink3)' }}>até</span>
              <input type="date" className="form-input" style={{ width: 140 }} value={shareFim} onChange={e => setShareFim(e.target.value)} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 6 }}>{entradas.length} registro(s) encontrado(s)</div>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{txt}</pre>
          </div>
        )
        return (
          <ShareExportModal
            aberto={shareOpen}
            onClose={() => setShareOpen(false)}
            titulo="Registro(s) do Dia"
            subtitulo={shareIni === shareFim ? shareIni.split('-').reverse().join('/') : `${shareIni.split('-').reverse().join('/')} a ${shareFim.split('-').reverse().join('/')}`}
            conteudoTexto={txt}
            conteudoPreview={htmlPreview}
            linkRelativo="Registro do Dia"
          />
        )
      })()}
    </div>
  )
}

// ─── RELATÓRIOS ──────────────────────────────────────────────
export function Relatorios() {
  const { children, educadoras, registros, rotinaCount, rotinaTotal } = useApp()
  const [periodo, setPeriodo] = useState(() => {
    const h = new Date()
    const ini = new Date(h.getFullYear(), h.getMonth(), 1).toISOString().split('T')[0]
    const fim = new Date(h.getFullYear(), h.getMonth() + 1, 0).toISOString().split('T')[0]
    return { ini, fim }
  })
  const [filtroTipo, setFiltroTipo] = useState('geral') // geral | crianca | educadora
  const [shareOpen, setShareOpen] = useState(false)

  // Dados agregados do período
  const { ocorrencias, chamada, ponto } = useMemo(() => ({
    ocorrencias: lsGetOP('integral_ocorrencias', []),
    chamada: lsGetOP('integral_chamada', {}),
    ponto: lsGetOP('integral_ponto', {}),
  }), [shareOpen, periodo])

  const ocNoPeriodo = ocorrencias.filter(o => o.data >= periodo.ini && o.data <= periodo.fim)
  const breakdownCategorias = ocNoPeriodo.reduce((acc, o) => {
    acc[o.categoria] = (acc[o.categoria] || 0) + 1
    return acc
  }, {})
  const breakdownGravidade = ocNoPeriodo.reduce((acc, o) => {
    acc[o.gravidade] = (acc[o.gravidade] || 0) + 1
    return acc
  }, {})

  // Faltas por criança no período
  const faltasPorCrianca = children.map(c => {
    let faltas = 0, presentes = 0
    Object.entries(chamada).forEach(([d, regs]) => {
      if (d < periodo.ini || d > periodo.fim) return
      if (regs[c.id] === 'falta') faltas++
      if (regs[c.id] === 'presente') presentes++
    })
    const ocEnv = ocNoPeriodo.filter(o => o.criancas_ids?.includes(c.id)).length
    return { crianca: c, faltas, presentes, ocorrencias: ocEnv }
  })

  // Faltas por educadora no período
  const faltasPorEdu = educadoras.map(e => {
    const regs = ponto[e.id] || {}
    let faltas = 0, justificadas = 0, presentes = 0
    Object.entries(regs).forEach(([d, reg]) => {
      if (d < periodo.ini || d > periodo.fim) return
      if (reg.status === 'F') faltas++
      else if (reg.status === 'J') justificadas++
      else presentes++
    })
    const ocEnv = ocNoPeriodo.filter(o => o.educadoras_ids?.includes(e.id)).length
    return { edu: e, faltas, justificadas, presentes, ocorrencias: ocEnv }
  })

  const textoRelatorio = [
    `Período: ${periodo.ini.split('-').reverse().join('/')} a ${periodo.fim.split('-').reverse().join('/')}`,
    '',
    `— OCORRÊNCIAS (${ocNoPeriodo.length}) —`,
    `Por categoria: ${Object.entries(breakdownCategorias).map(([k, v]) => `${k}:${v}`).join(', ') || 'nenhuma'}`,
    `Por gravidade: ${Object.entries(breakdownGravidade).map(([k, v]) => `${k}:${v}`).join(', ') || 'nenhuma'}`,
    '',
    `— FREQUÊNCIA CRIANÇAS —`,
    ...faltasPorCrianca.map(x => `${x.crianca.nome}: ${x.presentes} presenças, ${x.faltas} faltas, ${x.ocorrencias} ocorrência(s)`),
    '',
    `— FREQUÊNCIA EDUCADORAS —`,
    ...faltasPorEdu.map(x => `${x.edu.nome} (${x.edu.tipo}): ${x.presentes} presenças, ${x.faltas} faltas, ${x.justificadas} just., ${x.ocorrencias} ocorrência(s)`),
  ].join('\n')

  const weekBars = [8, 9, 7, 10, rotinaCount]

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div><div className="page-title"><span className="title-icon">📊</span> Relatórios</div>
        <div className="page-subtitle">Visão geral do trabalho pedagógico</div></div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setShareOpen(true)}>📤 Compartilhar</button>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>🖨️ Imprimir</button>
        </div>
      </div>

      <ShareExportModal
        aberto={shareOpen}
        onClose={() => setShareOpen(false)}
        titulo="Relatório Geral"
        subtitulo={`${periodo.ini.split('-').reverse().join('/')} a ${periodo.fim.split('-').reverse().join('/')}`}
        conteudoTexto={textoRelatorio}
        linkRelativo="Relatórios"
      />

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">De</label>
          <input type="date" className="form-input" value={periodo.ini} onChange={e => setPeriodo(p => ({ ...p, ini: e.target.value }))} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Até</label>
          <input type="date" className="form-input" value={periodo.fim} onChange={e => setPeriodo(p => ({ ...p, fim: e.target.value }))} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-xs" onClick={() => {
            const h = new Date()
            setPeriodo({ ini: new Date(h.getFullYear(), h.getMonth(), 1).toISOString().split('T')[0], fim: new Date(h.getFullYear(), h.getMonth() + 1, 0).toISOString().split('T')[0] })
          }}>Mês atual</button>
          <button className="btn btn-ghost btn-xs" onClick={() => {
            const h = new Date()
            setPeriodo({ ini: new Date(h.getFullYear(), 0, 1).toISOString().split('T')[0], fim: new Date(h.getFullYear(), 11, 31).toISOString().split('T')[0] })
          }}>Ano</button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {[['geral','Geral'],['crianca','Por criança'],['educadora','Por educadora']].map(([k, l]) => (
            <button key={k} onClick={() => setFiltroTipo(k)}
              style={{ padding: '5px 14px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${filtroTipo === k ? 'var(--sage)' : 'var(--warm3)'}`, background: filtroTipo === k ? 'var(--sage-light)' : '#fff', color: filtroTipo === k ? 'var(--sage-dark)' : 'var(--ink3)', fontWeight: filtroTipo === k ? 600 : 400 }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon green">🧒</div><div><div className="stat-num">{children.length}</div><div className="stat-label">Crianças</div></div></div>
        <div className="stat-card"><div className="stat-icon terra">👩‍🏫</div><div><div className="stat-num">{educadoras.length}</div><div className="stat-label">Educadoras</div></div></div>
        <div className="stat-card"><div className="stat-icon gold">⚡</div><div><div className="stat-num">{ocNoPeriodo.length}</div><div className="stat-label">Ocorrências período</div></div></div>
        <div className="stat-card"><div className="stat-icon plum">✅</div><div><div className="stat-num">{rotinaCount}/{rotinaTotal}</div><div className="stat-label">Rotina hoje</div></div></div>
      </div>

      {filtroTipo === 'geral' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-title">⚡ Ocorrências por categoria</div>
            {Object.keys(breakdownCategorias).length === 0 && <div style={{ fontSize: 13, color: 'var(--ink4)' }}>Nenhuma ocorrência no período</div>}
            {Object.entries(breakdownCategorias).map(([cat, n]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--ink2)', textTransform: 'capitalize' }}>{cat.replace('_', ' ')}</div>
                <div style={{ flex: 2, height: 8, background: 'var(--warm2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(n / ocNoPeriodo.length) * 100}%`, height: '100%', background: 'var(--terracotta)' }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, minWidth: 26, textAlign: 'right' }}>{n}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">▲ Ocorrências por gravidade</div>
            {Object.keys(breakdownGravidade).length === 0 && <div style={{ fontSize: 13, color: 'var(--ink4)' }}>Nenhuma ocorrência no período</div>}
            {[['baixa','#27500a'],['media','#854f0b'],['alta','#a32d2d'],['critica','#791f1f']].map(([g, cor]) => (
              breakdownGravidade[g] > 0 && (
                <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1, fontSize: 12, color: 'var(--ink2)', textTransform: 'capitalize' }}>{g}</div>
                  <div style={{ flex: 2, height: 8, background: 'var(--warm2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(breakdownGravidade[g] / ocNoPeriodo.length) * 100}%`, height: '100%', background: cor }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, minWidth: 26, textAlign: 'right' }}>{breakdownGravidade[g]}</div>
                </div>
              )
            ))}
          </div>
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="card-title">📊 Rotina — Semana atual (indicador)</div>
            <div className="mini-chart">
              {weekBars.map((v,i) => <div key={i} className="chart-bar" style={{ height: `${v/10*100}%`, background: i===4?'var(--sage)':'var(--sage-mid)' }} />)}
            </div>
            <div className="chart-labels">{['Seg','Ter','Qua','Qui','Sex'].map(d=><div key={d} className="chart-label">{d}</div>)}</div>
          </div>
        </div>
      )}

      {filtroTipo === 'crianca' && (
        <div className="card">
          <div className="card-title">🧒 Detalhamento por criança</div>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--warm3)' }}>
                {['Criança','Presenças','Faltas','Ocorrências','Observações'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Criança' ? 'left' : 'center', padding: 8, fontSize: 11, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {faltasPorCrianca.map(x => (
                <tr key={x.crianca.id} style={{ borderBottom: '1px solid var(--warm3)' }}>
                  <td style={{ padding: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10, background: x.crianca.cor?.[0] || '#e8f0eb', color: x.crianca.cor?.[1] || '#2d5240' }}>{x.crianca.nome.substring(0, 1)}</div>
                      {x.crianca.nome}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: 8 }}><span className="tag tag-green">{x.presentes}</span></td>
                  <td style={{ textAlign: 'center', padding: 8 }}>{x.faltas > 0 ? <span className="tag tag-terra">{x.faltas}</span> : '—'}</td>
                  <td style={{ textAlign: 'center', padding: 8 }}>{x.ocorrencias > 0 ? <span className="tag tag-gold">{x.ocorrencias}</span> : '—'}</td>
                  <td style={{ textAlign: 'center', padding: 8, color: 'var(--ink3)', fontSize: 12 }}>{x.crianca.obs?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtroTipo === 'educadora' && (
        <div className="card">
          <div className="card-title">👩‍🏫 Detalhamento por educadora</div>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--warm3)' }}>
                {['Educadora','Tipo','Presenças','Faltas','Just.','Ocorrências'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Educadora' ? 'left' : 'center', padding: 8, fontSize: 11, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {faltasPorEdu.map(x => (
                <tr key={x.edu.id} style={{ borderBottom: '1px solid var(--warm3)' }}>
                  <td style={{ padding: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10, background: x.edu.cor?.[0] || '#e8f0eb', color: x.edu.cor?.[1] || '#2d5240' }}>{x.edu.nome.substring(0, 2)}</div>
                      {x.edu.nome}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: 8, fontSize: 11, color: 'var(--ink3)' }}>{x.edu.tipo}</td>
                  <td style={{ textAlign: 'center', padding: 8 }}><span className="tag tag-green">{x.presentes}</span></td>
                  <td style={{ textAlign: 'center', padding: 8 }}>{x.faltas > 0 ? <span className="tag tag-terra">{x.faltas}</span> : '—'}</td>
                  <td style={{ textAlign: 'center', padding: 8 }}>{x.justificadas > 0 ? <span className="tag tag-gold">{x.justificadas}</span> : '—'}</td>
                  <td style={{ textAlign: 'center', padding: 8 }}>{x.ocorrencias > 0 ? <span className="tag tag-gold">{x.ocorrencias}</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
