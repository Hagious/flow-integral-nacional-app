import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth, registrarAuditoria } from '../context/AuthContext.jsx'

// ─── Constantes ───────────────────────────────────────────────

const CATEGORIAS = [
  { id: 'comportamental', label: 'Comportamental (aluno)', icon: '⚡', cor: '#c4714a', corLight: '#f5ece6' },
  { id: 'incidente_fisico', label: 'Incidente físico', icon: '🩹', cor: '#a32d2d', corLight: '#fce8e8' },
  { id: 'reclamacao_familia', label: 'Reclamação de família', icon: '👨‍👩‍👧', cor: '#185fa5', corLight: '#e6f1fb' },
  { id: 'conduta_profissional', label: 'Conduta de profissional', icon: '👩‍🏫', cor: '#6b4e71', corLight: '#ede5f0' },
  { id: 'operacional', label: 'Estrutural / Operacional', icon: '🏫', cor: '#854f0b', corLight: '#faeeda' },
  { id: 'saude', label: 'Saúde / Médico', icon: '🏥', cor: '#0f6e56', corLight: '#e1f5ee' },
  { id: 'outros', label: 'Outros', icon: '📋', cor: '#5f5e5a', corLight: '#f1efe8' },
]

const STATUS = [
  { id: 'aberta', label: 'Aberta', cor: '#a32d2d', bg: '#fce8e8' },
  { id: 'acompanhamento', label: 'Em acompanhamento', cor: '#854f0b', bg: '#faeeda' },
  { id: 'resolvida', label: 'Resolvida', cor: '#27500a', bg: '#eaf3de' },
  { id: 'arquivada', label: 'Arquivada', cor: '#5f5e5a', bg: '#f1efe8' },
]

const ENCAMINHAMENTOS = [
  'Comunicado à família',
  'Encaminhado à coordenação',
  'Encaminhado à direção',
  'Encaminhado ao RH',
  'Registro no livro de ocorrências físico',
  'Aguarda retorno da família',
  'Aguarda providência da direção',
  'Sem encaminhamento necessário',
]

const GRAVIDADE = [
  { id: 'baixa', label: 'Baixa', cor: '#27500a', bg: '#eaf3de' },
  { id: 'media', label: 'Média', cor: '#854f0b', bg: '#faeeda' },
  { id: 'alta', label: 'Alta', cor: '#a32d2d', bg: '#fce8e8' },
  { id: 'critica', label: 'Crítica', cor: '#791f1f', bg: '#f7c1c1' },
]

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

// ─── Badge helpers ────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS.find(x => x.id === status) || STATUS[0]
  return <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: s.bg, color: s.cor }}>{s.label}</span>
}
function GravidadeBadge({ gravidade }) {
  const g = GRAVIDADE.find(x => x.id === gravidade) || GRAVIDADE[0]
  return <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: g.bg, color: g.cor }}>▲ {g.label}</span>
}
function CategoriaBadge({ categoria }) {
  const c = CATEGORIAS.find(x => x.id === categoria)
  if (!c) return null
  return <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, background: c.corLight, color: c.cor }}>{c.icon} {c.label}</span>
}

// ─── Formulário de nova ocorrência ────────────────────────────
function FormOcorrencia({ inicial, onSave, onCancel, educadoras, criancas }) {
  const { user } = useAuth()
  const now = new Date()
  const [form, setForm] = useState(inicial || {
    titulo: '',
    data: now.toISOString().split('T')[0],
    hora: now.toTimeString().slice(0, 5),
    categoria: 'comportamental',
    gravidade: 'media',
    descricao: '',
    local: '',
    // Participantes
    criancas_ids: [],
    educadoras_ids: [],
    terceiros: '', // texto livre: "Maria (mãe do João), João (entregador)"
    // Encaminhamento
    encaminhamentos: [],
    observacoes_encaminhamento: '',
    // Status e resolução
    status: 'aberta',
    resolucao: '',
    registrado_por: user?.nome || '',
  })

  function toggleArr(key, val) {
    setForm(p => ({ ...p, [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val] }))
  }
  function toggleEnc(enc) {
    setForm(p => ({ ...p, encaminhamentos: p.encaminhamentos.includes(enc) ? p.encaminhamentos.filter(x => x !== enc) : [...p.encaminhamentos, enc] }))
  }

  const cat = CATEGORIAS.find(c => c.id === form.categoria)
  const canSave = form.titulo.trim().length > 0 && form.descricao.trim().length > 0

  return (
    <div style={{ background: '#fff', border: '1px solid var(--warm3)', borderRadius: 'var(--r)', padding: 24 }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 20, color: 'var(--ink)' }}>
        {inicial ? '✏️ Editar ocorrência' : '⚡ Registrar nova ocorrência'}
      </div>

      {/* Cabeçalho básico */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
          <label className="form-label">Título / Resumo da ocorrência *</label>
          <input className="form-input" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Ex: Conflito entre alunos durante atividade na horta" />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Data *</label>
          <input type="date" className="form-input" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Horário aproximado</label>
          <input type="time" className="form-input" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Local</label>
          <input className="form-input" value={form.local} onChange={e => setForm(p => ({ ...p, local: e.target.value }))} placeholder="Ex: Refeitório, Horta, Sala de referência..." />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Registrado por</label>
          <input className="form-input" value={form.registrado_por} onChange={e => setForm(p => ({ ...p, registrado_por: e.target.value }))} />
        </div>
      </div>

      {/* Categoria */}
      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Categoria da ocorrência *</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIAS.map(c => (
            <button key={c.id} onClick={() => setForm(p => ({ ...p, categoria: c.id }))}
              style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `2px solid ${form.categoria === c.id ? c.cor : 'var(--warm3)'}`, background: form.categoria === c.id ? c.corLight : '#fff', color: form.categoria === c.id ? c.cor : 'var(--ink3)', fontWeight: form.categoria === c.id ? 600 : 400 }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gravidade */}
      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Gravidade</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {GRAVIDADE.map(g => (
            <button key={g.id} onClick={() => setForm(p => ({ ...p, gravidade: g.id }))}
              style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `2px solid ${form.gravidade === g.id ? g.cor : 'var(--warm3)'}`, background: form.gravidade === g.id ? g.bg : '#fff', color: form.gravidade === g.id ? g.cor : 'var(--ink3)', fontWeight: form.gravidade === g.id ? 700 : 400 }}>
              ▲ {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Descrição */}
      <div className="form-group" style={{ marginBottom: 20 }}>
        <label className="form-label">Descrição detalhada da ocorrência *</label>
        <textarea className="form-input" style={{ minHeight: 110 }} value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
          placeholder="Descreva o que aconteceu com detalhes: contexto, sequência dos fatos, reações dos envolvidos, providências imediatas tomadas..." />
      </div>

      {/* ─── PARTICIPANTES ─── */}
      <div style={{ background: 'var(--warm)', borderRadius: 'var(--r)', padding: 16, marginBottom: 20 }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, color: 'var(--ink)', marginBottom: 14 }}>👥 Participantes da ocorrência</div>

        {/* Crianças */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Crianças envolvidas</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {criancas.map(c => {
              const sel = form.criancas_ids.includes(c.id)
              return (
                <button key={c.id} onClick={() => toggleArr('criancas_ids', c.id)}
                  style={{ padding: '5px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${sel ? '#c4714a' : 'var(--warm3)'}`, background: sel ? '#f5ece6' : '#fff', color: sel ? '#8b3e21' : 'var(--ink3)', fontWeight: sel ? 600 : 400, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div className="avatar" style={{ width: 18, height: 18, fontSize: 9, background: c.cor?.[0] || '#e8f0eb', color: c.cor?.[1] || '#2d5240' }}>{c.nome?.substring(0, 1)}</div>
                  {c.nome}
                  {sel && <span style={{ color: '#c4714a' }}>✓</span>}
                </button>
              )
            })}
            {criancas.length === 0 && <span style={{ fontSize: 12, color: 'var(--ink4)' }}>Nenhuma criança cadastrada</span>}
          </div>
        </div>

        {/* Educadoras/Apoio */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Educadoras / Apoio envolvidos</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {educadoras.map(e => {
              const sel = form.educadoras_ids.includes(e.id)
              return (
                <button key={e.id} onClick={() => toggleArr('educadoras_ids', e.id)}
                  style={{ padding: '5px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${sel ? '#4a7c59' : 'var(--warm3)'}`, background: sel ? '#e8f0eb' : '#fff', color: sel ? '#2d5240' : 'var(--ink3)', fontWeight: sel ? 600 : 400, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div className="avatar" style={{ width: 18, height: 18, fontSize: 9, background: e.cor?.[0] || '#e8f0eb', color: e.cor?.[1] || '#2d5240' }}>{e.nome?.substring(0, 1)}</div>
                  {e.nome}
                  <span style={{ fontSize: 10, color: 'var(--ink4)' }}>({e.tipo})</span>
                  {sel && <span style={{ color: '#4a7c59' }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Terceiros */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Terceiros (pais, visitantes, outros)</label>
          <input className="form-input" value={form.terceiros} onChange={e => setForm(p => ({ ...p, terceiros: e.target.value }))}
            placeholder="Ex: Maria Santos (mãe do João), Pedro (entregador), Dra. Ana (pediatra)" />
          <div style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 4 }}>Digite os nomes e vínculos das pessoas externas ao quadro de funcionários</div>
        </div>
      </div>

      {/* ─── ENCAMINHAMENTOS ─── */}
      <div style={{ marginBottom: 20 }}>
        <label className="form-label">Encaminhamentos</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {ENCAMINHAMENTOS.map(enc => {
            const sel = form.encaminhamentos.includes(enc)
            return (
              <button key={enc} onClick={() => toggleEnc(enc)}
                style={{ padding: '5px 12px', borderRadius: 16, fontSize: 11, cursor: 'pointer', border: `1.5px solid ${sel ? '#185fa5' : 'var(--warm3)'}`, background: sel ? '#e6f1fb' : '#fff', color: sel ? '#0c447c' : 'var(--ink3)', fontWeight: sel ? 600 : 400 }}>
                {sel ? '✓ ' : ''}{enc}
              </button>
            )
          })}
        </div>
        <textarea className="form-input" style={{ minHeight: 60 }} value={form.observacoes_encaminhamento} onChange={e => setForm(p => ({ ...p, observacoes_encaminhamento: e.target.value }))}
          placeholder="Observações adicionais sobre os encaminhamentos..." />
      </div>

      {/* Status */}
      <div style={{ marginBottom: 20 }}>
        <label className="form-label">Status</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {STATUS.map(s => (
            <button key={s.id} onClick={() => setForm(p => ({ ...p, status: s.id }))}
              style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `2px solid ${form.status === s.id ? s.cor : 'var(--warm3)'}`, background: form.status === s.id ? s.bg : '#fff', color: form.status === s.id ? s.cor : 'var(--ink3)', fontWeight: form.status === s.id ? 700 : 400 }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resolução */}
      {['resolvida', 'arquivada'].includes(form.status) && (
        <div className="form-group">
          <label className="form-label">Descrição da resolução</label>
          <textarea className="form-input" style={{ minHeight: 70 }} value={form.resolucao} onChange={e => setForm(p => ({ ...p, resolucao: e.target.value }))}
            placeholder="Como foi resolvida? Quais medidas foram tomadas? Qual foi o desfecho?" />
        </div>
      )}

      {/* Ações */}
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button className="btn btn-primary" disabled={!canSave} onClick={() => onSave(form)}
          style={{ opacity: canSave ? 1 : 0.5 }}>
          💾 Salvar ocorrência
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        {!canSave && <span style={{ fontSize: 12, color: 'var(--ink3)', display: 'flex', alignItems: 'center' }}>Preencha título e descrição para salvar</span>}
      </div>
    </div>
  )
}

// ─── Card de ocorrência ───────────────────────────────────────
function OcorrenciaCard({ oc, onEdit, onUpdateStatus, criancas, educadoras }) {
  const [expanded, setExpanded] = useState(false)
  const cat = CATEGORIAS.find(c => c.id === oc.categoria)

  const criancasEnv = criancas.filter(c => oc.criancas_ids?.includes(c.id))
  const eduEnv = educadoras.filter(e => oc.educadoras_ids?.includes(e.id))

  return (
    <div style={{ background: '#fff', border: `1px solid ${oc.gravidade === 'critica' ? '#f09595' : oc.gravidade === 'alta' ? '#FAC775' : 'var(--warm3)'}`, borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 12, borderLeft: `4px solid ${cat?.cor || '#888'}` }}>

      {/* Header clicável */}
      <div style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{cat?.icon || '📋'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink)' }}>{oc.titulo}</span>
            <GravidadeBadge gravidade={oc.gravidade} />
            <StatusBadge status={oc.status} />
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ink3)', flexWrap: 'wrap' }}>
            <span>📅 {oc.data?.split('-').reverse().join('/')} {oc.hora && `às ${oc.hora}`}</span>
            {oc.local && <span>📍 {oc.local}</span>}
            {oc.registrado_por && <span>✍️ {oc.registrado_por}</span>}
          </div>
          {/* Participantes resumo */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {criancasEnv.map(c => (
              <span key={c.id} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#f5ece6', color: '#8b3e21', fontWeight: 500 }}>🧒 {c.nome}</span>
            ))}
            {eduEnv.map(e => (
              <span key={e.id} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#e8f0eb', color: '#2d5240', fontWeight: 500 }}>👩‍🏫 {e.nome}</span>
            ))}
            {oc.terceiros && oc.terceiros.split(',').slice(0, 2).map((t, i) => (
              <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#e6f1fb', color: '#0c447c', fontWeight: 500 }}>👤 {t.trim()}</span>
            ))}
          </div>
        </div>
        <span style={{ color: 'var(--ink4)', fontSize: 16, flexShrink: 0, marginTop: 2 }}>{expanded ? '⌃' : '⌄'}</span>
      </div>

      {/* Detalhes expandidos */}
      {expanded && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--warm3)' }}>
          <div style={{ paddingTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Descrição</div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7, background: 'var(--warm)', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
              {oc.descricao}
            </div>

            {/* Todos os participantes */}
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Participantes</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {criancasEnv.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#f5ece6', border: '1px solid #e8a882' }}>
                  <div className="avatar" style={{ width: 22, height: 22, fontSize: 10, background: c.cor?.[0] || '#e8f0eb', color: c.cor?.[1] || '#2d5240' }}>{c.nome?.substring(0, 1)}</div>
                  <span style={{ fontSize: 12, color: '#8b3e21', fontWeight: 500 }}>{c.nome}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink4)' }}>criança</span>
                </div>
              ))}
              {eduEnv.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#e8f0eb', border: '1px solid #c5d9c9' }}>
                  <div className="avatar" style={{ width: 22, height: 22, fontSize: 10, background: e.cor?.[0] || '#e8f0eb', color: e.cor?.[1] || '#2d5240' }}>{e.nome?.substring(0, 1)}</div>
                  <span style={{ fontSize: 12, color: '#2d5240', fontWeight: 500 }}>{e.nome}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink4)' }}>{e.tipo}</span>
                </div>
              ))}
              {oc.terceiros && oc.terceiros.split(',').map((t, i) => t.trim() && (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#e6f1fb', border: '1px solid #b5d4f4' }}>
                  <span style={{ fontSize: 14 }}>👤</span>
                  <span style={{ fontSize: 12, color: '#0c447c', fontWeight: 500 }}>{t.trim()}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink4)' }}>externo</span>
                </div>
              ))}
            </div>

            {/* Encaminhamentos */}
            {oc.encaminhamentos?.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Encaminhamentos</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {oc.encaminhamentos.map((enc, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: '#e6f1fb', color: '#0c447c', fontWeight: 500 }}>✓ {enc}</span>
                  ))}
                </div>
                {oc.observacoes_encaminhamento && <div style={{ fontSize: 12, color: 'var(--ink3)', fontStyle: 'italic', marginBottom: 14 }}>{oc.observacoes_encaminhamento}</div>}
              </>
            )}

            {/* Resolução */}
            {oc.resolucao && (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Resolução</div>
                <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7, background: '#eaf3de', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                  {oc.resolucao}
                </div>
              </>
            )}

            {/* Ações */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-xs" onClick={() => onEdit(oc)}>✏️ Editar</button>
              {oc.status === 'aberta' && (
                <button className="btn btn-xs" style={{ background: '#faeeda', color: '#633806', border: 'none', cursor: 'pointer', padding: '5px 12px', borderRadius: 6, fontSize: 11 }}
                  onClick={() => onUpdateStatus(oc.id, 'acompanhamento')}>
                  → Em acompanhamento
                </button>
              )}
              {oc.status === 'acompanhamento' && (
                <button className="btn btn-xs" style={{ background: '#eaf3de', color: '#27500a', border: 'none', cursor: 'pointer', padding: '5px 12px', borderRadius: 6, fontSize: 11 }}
                  onClick={() => onUpdateStatus(oc.id, 'resolvida')}>
                  ✓ Marcar como resolvida
                </button>
              )}
              {oc.status === 'resolvida' && (
                <button className="btn btn-xs" style={{ background: '#f1efe8', color: '#5f5e5a', border: 'none', cursor: 'pointer', padding: '5px 12px', borderRadius: 6, fontSize: 11 }}
                  onClick={() => onUpdateStatus(oc.id, 'arquivada')}>
                  📁 Arquivar
                </button>
              )}
              <button className="btn btn-ghost btn-xs" onClick={() => {
                const texto = [
                  `OCORRÊNCIA — ${oc.titulo}`,
                  `Data: ${oc.data?.split('-').reverse().join('/')} ${oc.hora ? 'às ' + oc.hora : ''}`,
                  `Categoria: ${CATEGORIAS.find(c => c.id === oc.categoria)?.label}`,
                  `Gravidade: ${GRAVIDADE.find(g => g.id === oc.gravidade)?.label}`,
                  `Local: ${oc.local || '—'}`,
                  `Registrado por: ${oc.registrado_por}`,
                  '',
                  'DESCRIÇÃO:',
                  oc.descricao,
                  '',
                  'PARTICIPANTES:',
                  `Crianças: ${criancasEnv.map(c => c.nome).join(', ') || '—'}`,
                  `Educadoras: ${eduEnv.map(e => e.nome).join(', ') || '—'}`,
                  `Terceiros: ${oc.terceiros || '—'}`,
                  '',
                  `Encaminhamentos: ${oc.encaminhamentos?.join(', ') || '—'}`,
                  oc.resolucao ? `\nRESOLUÇÃO:\n${oc.resolucao}` : '',
                ].join('\n')
                navigator.clipboard?.writeText(texto)
              }}>📋 Copiar texto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────
export default function Ocorrencias() {
  const { children, educadoras, showToast } = useApp()
  const { user } = useAuth()

  const [ocorrencias, setOcorrencias] = useState(() => lsGet('integral_ocorrencias', []))
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [filtros, setFiltros] = useState({ status: '', categoria: '', gravidade: '', busca: '', data: '' })

  function saveOcorrencia(form) {
    const isEdit = !!editando
    if (isEdit) {
      const antiga = ocorrencias.find(o => o.id === editando.id)
      const n = ocorrencias.map(o => o.id === editando.id ? { ...o, ...form, id: o.id, updated_at: new Date().toISOString() } : o)
      setOcorrencias(n); lsSet('integral_ocorrencias', n)
      registrarAuditoria('editar', 'ocorrencias', editando.id, antiga, form, user?.nome)
      showToast('Ocorrência atualizada!')
    } else {
      const nova = { ...form, id: Date.now().toString(), created_at: new Date().toISOString() }
      const n = [nova, ...ocorrencias]
      setOcorrencias(n); lsSet('integral_ocorrencias', n)
      registrarAuditoria('criar', 'ocorrencias', nova.id, null, nova, user?.nome)
      showToast('Ocorrência registrada!')
    }
    setShowForm(false); setEditando(null)
  }

  function updateStatus(id, status) {
    const antiga = ocorrencias.find(o => o.id === id)
    const n = ocorrencias.map(o => o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o)
    setOcorrencias(n); lsSet('integral_ocorrencias', n)
    registrarAuditoria('editar', 'ocorrencias', id, { status: antiga?.status }, { status }, user?.nome)
    showToast(`Status atualizado: ${STATUS.find(s => s.id === status)?.label}`)
  }

  const filtradas = useMemo(() => ocorrencias.filter(o => {
    if (filtros.status && o.status !== filtros.status) return false
    if (filtros.categoria && o.categoria !== filtros.categoria) return false
    if (filtros.gravidade && o.gravidade !== filtros.gravidade) return false
    if (filtros.data && o.data !== filtros.data) return false
    if (filtros.busca) {
      const q = filtros.busca.toLowerCase()
      const cNomes = children.filter(c => o.criancas_ids?.includes(c.id)).map(c => c.nome.toLowerCase()).join(' ')
      const eNomes = educadoras.filter(e => o.educadoras_ids?.includes(e.id)).map(e => e.nome.toLowerCase()).join(' ')
      return o.titulo?.toLowerCase().includes(q) || o.descricao?.toLowerCase().includes(q) || cNomes.includes(q) || eNomes.includes(q) || o.terceiros?.toLowerCase().includes(q)
    }
    return true
  }), [ocorrencias, filtros, children, educadoras])

  // Estatísticas
  const stats = useMemo(() => ({
    total: ocorrencias.length,
    abertas: ocorrencias.filter(o => o.status === 'aberta').length,
    acompanhamento: ocorrencias.filter(o => o.status === 'acompanhamento').length,
    criticas: ocorrencias.filter(o => o.gravidade === 'critica' || o.gravidade === 'alta').length,
    mesAtual: ocorrencias.filter(o => o.data?.startsWith(new Date().toISOString().slice(0, 7))).length,
  }), [ocorrencias])

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">⚡</span> Ocorrências</div>
          <div className="page-subtitle">Registro formal de incidentes, conflitos e situações relevantes</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditando(null) }}>+ Registrar Ocorrência</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon terra">⚡</div>
          <div><div className="stat-num">{stats.abertas}</div><div className="stat-label">Abertas</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">🔄</div>
          <div><div className="stat-num">{stats.acompanhamento}</div><div className="stat-label">Em acompanhamento</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fce8e8' }}>🔴</div>
          <div><div className="stat-num">{stats.criticas}</div><div className="stat-label">Alta/Crítica</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📅</div>
          <div><div className="stat-num">{stats.mesAtual}</div><div className="stat-label">Este mês</div></div>
        </div>
      </div>

      {/* Formulário */}
      {(showForm || editando) && (
        <div style={{ marginBottom: 24 }}>
          <FormOcorrencia
            inicial={editando}
            onSave={saveOcorrencia}
            onCancel={() => { setShowForm(false); setEditando(null) }}
            educadoras={educadoras}
            criancas={children}
          />
        </div>
      )}

      {/* Filtros */}
      <div style={{ background: '#fff', border: '1px solid var(--warm3)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" style={{ flex: 2, minWidth: 180 }} placeholder="🔍 Buscar em título, descrição, participantes..." value={filtros.busca} onChange={e => setFiltros(p => ({ ...p, busca: e.target.value }))} />
        <select className="form-input" style={{ flex: 1, minWidth: 130 }} value={filtros.status} onChange={e => setFiltros(p => ({ ...p, status: e.target.value }))}>
          <option value="">Todos os status</option>
          {STATUS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select className="form-input" style={{ flex: 1, minWidth: 160 }} value={filtros.categoria} onChange={e => setFiltros(p => ({ ...p, categoria: e.target.value }))}>
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
        <select className="form-input" style={{ flex: 1, minWidth: 120 }} value={filtros.gravidade} onChange={e => setFiltros(p => ({ ...p, gravidade: e.target.value }))}>
          <option value="">Toda gravidade</option>
          {GRAVIDADE.map(g => <option key={g.id} value={g.id}>▲ {g.label}</option>)}
        </select>
        <input type="date" className="form-input" style={{ flex: 1, minWidth: 140 }} value={filtros.data} onChange={e => setFiltros(p => ({ ...p, data: e.target.value }))} />
        <span style={{ fontSize: 12, color: 'var(--ink3)', whiteSpace: 'nowrap' }}>{filtradas.length} de {ocorrencias.length}</span>
      </div>

      {/* Lista */}
      {filtradas.map(oc => (
        <OcorrenciaCard
          key={oc.id} oc={oc}
          onEdit={o => { setEditando(o); setShowForm(false) }}
          onUpdateStatus={updateStatus}
          criancas={children}
          educadoras={educadoras}
        />
      ))}

      {filtradas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: 15 }}>{ocorrencias.length === 0 ? 'Nenhuma ocorrência registrada.' : 'Nenhuma ocorrência com esses filtros.'}</div>
          <div style={{ fontSize: 13, marginTop: 4, color: 'var(--ink4)' }}>
            {ocorrencias.length === 0 ? 'Clique em "Registrar Ocorrência" para adicionar.' : 'Limpe os filtros para ver todas.'}
          </div>
        </div>
      )}
    </div>
  )
}
