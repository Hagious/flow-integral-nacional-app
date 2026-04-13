import { useState, useMemo } from 'react'
import {
  CAMPOS_EXPERIENCIA, OBJETIVOS_APRENDIZAGEM,
  TIPOS_ATIVIDADE, ESPACOS, ATIVIDADES_EXEMPLO
} from '../data/bncc.js'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

// ─── IA: Gerador de descrição pedagógica ─────────────────────
async function gerarDescricaoPedagogica(atividade, objetivosSelecionados) {
  const objetivosTexto = objetivosSelecionados.map(o => `${o.codigo}: ${o.texto}`).join('\n')
  const campos = atividade.camposExperiencia.map(c =>
    CAMPOS_EXPERIENCIA.find(ce => ce.sigla === c)?.nome
  ).join(', ')

  const prompt = `Você é uma especialista em educação infantil com profundo conhecimento na abordagem Reggio Emilia e na BNCC.

Crie uma descrição pedagógica completa para a seguinte atividade, no mesmo padrão usado pela professora Micheline do Colégio Nacional (Educação para Sempre):

ATIVIDADE: ${atividade.titulo}
TIPO: ${atividade.tipo}
ESPAÇO: ${atividade.espaco}
MATERIAIS: ${atividade.materiais}
DESCRIÇÃO INICIAL: ${atividade.descricao}
FAIXA ETÁRIA: ${atividade.faixaEtaria?.join(', ')}
CAMPOS DE EXPERIÊNCIA: ${campos}

OBJETIVOS DE APRENDIZAGEM SELECIONADOS:
${objetivosTexto}

INSTRUÇÕES:
- Escreva em 3 parágrafos curtos e objetivos
- Parágrafo 1: O que as crianças farão (ação concreta, espaço, materiais)
- Parágrafo 2: O que essa atividade desenvolve (aprendizagens esperadas)
- Parágrafo 3: Como o professor mediará (escuta, documentação, perguntas norteadoras)
- Use linguagem pedagógica rica mas acessível
- Mencione a abordagem Reggio Emilia quando pertinente
- No final, liste os objetivos BNCC no formato: EI03XX00: descrição curta.
- Máximo 200 palavras no total
- Tom: profissional, cuidadoso, respeitoso com a criança como protagonista`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    return data.content?.[0]?.text || ''
  } catch (e) {
    return null
  }
}

// ─── IA: Sugerir objetivos BNCC ──────────────────────────────
async function sugerirObjetivos(titulo, descricao, tipo) {
  const todosObjetivos = Object.values(OBJETIVOS_APRENDIZAGEM).flat()
  const prompt = `Você é especialista em BNCC Educação Infantil.

Analise esta atividade e retorne APENAS uma lista JSON com os códigos dos objetivos mais adequados (máximo 4):

ATIVIDADE: ${titulo}
TIPO: ${tipo}
DESCRIÇÃO: ${descricao}

Retorne SOMENTE um array JSON como: ["EI03CG02","EI03ET02","EI03EO03"]
Nenhum texto antes ou depois.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    const text = data.content?.[0]?.text || '[]'
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch (e) {
    return []
  }
}

// ─── Componente: Card de Atividade ───────────────────────────
function AtividadeCard({ ativ, onEdit, onSelect, selected }) {
  const tipo = TIPOS_ATIVIDADE.find(t => t.id === ativ.tipo)
  const campos = ativ.camposExperiencia?.map(c => CAMPOS_EXPERIENCIA.find(ce => ce.sigla === c)).filter(Boolean)

  return (
    <div
      onClick={() => onSelect?.(ativ)}
      style={{
        background: '#fff',
        border: selected ? '2px solid var(--sage)' : '1px solid var(--warm3)',
        borderRadius: 'var(--r)',
        padding: '16px',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.15s',
        position: 'relative',
        ...(selected ? { background: 'var(--sage-light)' } : {})
      }}
    >
      {selected && (
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--sage)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>✓</div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{tipo?.icon || '⭐'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 4 }}>{ativ.titulo}</div>
          <div style={{ fontSize: 11, color: '#fff', background: tipo?.cor || '#888', padding: '2px 8px', borderRadius: 10, display: 'inline-block', fontWeight: 500 }}>{tipo?.label}</div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--ink3)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {ativ.descricao}
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        {campos?.map(c => (
          <span key={c.sigla} style={{ fontSize: 10, background: c.corLight, color: c.cor, padding: '2px 7px', borderRadius: 10, fontWeight: 500 }}>
            {c.icon} {c.sigla}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--ink4)' }}>
        <span>📍 {ativ.espaco}</span>
        {ativ.projeto && <span>· 🗂️ {ativ.projeto}</span>}
        {onEdit && (
          <button
            onClick={e => { e.stopPropagation(); onEdit(ativ) }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sage)', fontSize: 12, padding: '2px 6px' }}
          >
            ✏️ Editar
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Formulário de cadastro/edição ───────────────────────────
function AtividadeForm({ inicial, onSave, onCancel }) {
  const [form, setForm] = useState(inicial || {
    titulo: '', tipo: 'vivencia_pesquisa', descricao: '',
    espaco: 'Sala de referência', materiais: '',
    faixaEtaria: ['Infantil'], camposExperiencia: [],
    objetivos: [], duracao: 50, tags: '', projeto: '', mes: new Date().getMonth() + 1
  })
  const [loadingIA, setLoadingIA] = useState(false)
  const [loadingObjetivos, setLoadingObjetivos] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [objetivosExpandido, setObjetivosExpandido] = useState(false)

  const todosObjetivos = useMemo(() =>
    form.camposExperiencia.flatMap(c => OBJETIVOS_APRENDIZAGEM[c] || []).filter(o => o.codigo.startsWith('EI03') || o.codigo.startsWith('EI02')),
    [form.camposExperiencia]
  )

  const objetivosSelecionados = useMemo(() =>
    Object.values(OBJETIVOS_APRENDIZAGEM).flat().filter(o => form.objetivos?.includes(o.codigo)),
    [form.objetivos]
  )

  function toast(msg) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

  function toggleCampo(sigla) {
    setForm(p => ({
      ...p,
      camposExperiencia: p.camposExperiencia.includes(sigla)
        ? p.camposExperiencia.filter(c => c !== sigla)
        : [...p.camposExperiencia, sigla]
    }))
  }

  function toggleObjetivo(codigo) {
    setForm(p => ({
      ...p,
      objetivos: p.objetivos?.includes(codigo)
        ? p.objetivos.filter(o => o !== codigo)
        : [...(p.objetivos || []), codigo]
    }))
  }

  async function handleSugerirObjetivos() {
    if (!form.titulo && !form.descricao) return
    setLoadingObjetivos(true)
    toast('Analisando atividade com IA...')
    const sugestoes = await sugerirObjetivos(form.titulo, form.descricao, form.tipo)
    if (sugestoes.length > 0) {
      // Auto-selecionar campos de experiência correspondentes
      const camposDetectados = [...new Set(sugestoes.map(c => c.substring(4, 6)))]
      setForm(p => ({
        ...p,
        objetivos: [...new Set([...(p.objetivos || []), ...sugestoes])],
        camposExperiencia: [...new Set([...p.camposExperiencia, ...camposDetectados])]
      }))
      toast(`✅ ${sugestoes.length} objetivos sugeridos!`)
    } else {
      toast('⚠️ Adicione título e descrição primeiro')
    }
    setLoadingObjetivos(false)
  }

  async function handleGerarDescricao() {
    if (!form.titulo) { toast('⚠️ Adicione o título primeiro'); return }
    setLoadingIA(true)
    toast('✨ Gerando descrição pedagógica...')
    const descricao = await gerarDescricaoPedagogica(form, objetivosSelecionados)
    if (descricao) {
      setForm(p => ({ ...p, descricao }))
      toast('✅ Descrição gerada com sucesso!')
    } else {
      toast('⚠️ Erro ao gerar. Tente novamente.')
    }
    setLoadingIA(false)
  }

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--r)', border: '1px solid var(--warm3)', padding: 24 }}>
      {toastMsg && (
        <div style={{ background: 'var(--ink)', color: '#fff', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          {toastMsg}
        </div>
      )}

      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 20, color: 'var(--ink)' }}>
        {inicial ? '✏️ Editar Atividade' : '+ Nova Atividade'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Título da atividade</label>
          <input className="form-input" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Ex: Pesquisa dos Ovos, Modelagem com Argila, Amarelinha..." />
        </div>

        <div>
          <label className="form-label">Tipo</label>
          <select className="form-input" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
            {TIPOS_ATIVIDADE.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="form-label">Espaço</label>
          <select className="form-input" value={form.espaco} onChange={e => setForm(p => ({ ...p, espaco: e.target.value }))}>
            {ESPACOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="form-label" style={{ margin: 0 }}>Descrição pedagógica</label>
            <button
              onClick={handleGerarDescricao}
              disabled={loadingIA}
              style={{ background: loadingIA ? 'var(--warm2)' : 'var(--sage)', color: loadingIA ? 'var(--ink3)' : '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}
            >
              {loadingIA ? '⏳ Gerando...' : '✨ Gerar com IA'}
            </button>
          </div>
          <textarea
            className="form-input"
            style={{ minHeight: 120 }}
            value={form.descricao}
            onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
            placeholder="Descreva a atividade... ou clique em 'Gerar com IA' após preencher título e objetivos"
          />
        </div>

        <div>
          <label className="form-label">Materiais necessários</label>
          <textarea className="form-input" style={{ minHeight: 60 }} value={form.materiais} onChange={e => setForm(p => ({ ...p, materiais: e.target.value }))} placeholder="Argila, tintas, sementes..." />
        </div>

        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="form-label">Duração (min)</label>
              <input type="number" className="form-input" value={form.duracao} onChange={e => setForm(p => ({ ...p, duracao: Number(e.target.value) }))} min={10} max={120} step={10} />
            </div>
            <div>
              <label className="form-label">Mês previsto</label>
              <select className="form-input" value={form.mes} onChange={e => setForm(p => ({ ...p, mes: Number(e.target.value) }))}>
                {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Projeto / Tema</label>
              <input className="form-input" value={form.projeto || ''} onChange={e => setForm(p => ({ ...p, projeto: e.target.value }))} placeholder="Ex: Pesquisa dos Ovos, Festa Junina..." />
            </div>
          </div>
        </div>
      </div>

      {/* Campos de Experiência */}
      <div style={{ marginTop: 18 }}>
        <label className="form-label">Campos de Experiência (BNCC)</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CAMPOS_EXPERIENCIA.map(c => (
            <button
              key={c.sigla}
              onClick={() => toggleCampo(c.sigla)}
              style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                border: `2px solid ${form.camposExperiencia.includes(c.sigla) ? c.cor : 'var(--warm3)'}`,
                background: form.camposExperiencia.includes(c.sigla) ? c.corLight : '#fff',
                color: form.camposExperiencia.includes(c.sigla) ? c.cor : 'var(--ink3)',
                fontWeight: form.camposExperiencia.includes(c.sigla) ? 600 : 400,
                transition: 'all 0.15s'
              }}
            >
              {c.icon} {c.sigla} — {c.nome.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Objetivos BNCC */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label className="form-label" style={{ margin: 0 }}>
            Objetivos de Aprendizagem
            {form.objetivos?.length > 0 && (
              <span style={{ marginLeft: 8, background: 'var(--sage)', color: '#fff', padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{form.objetivos.length} selecionados</span>
            )}
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleSugerirObjetivos}
              disabled={loadingObjetivos}
              style={{ background: loadingObjetivos ? 'var(--warm2)' : 'var(--gold-light)', color: loadingObjetivos ? 'var(--ink3)' : '#6b4a0a', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}
            >
              {loadingObjetivos ? '⏳ Analisando...' : '🤖 Sugerir com IA'}
            </button>
            <button
              onClick={() => setObjetivosExpandido(!objetivosExpandido)}
              style={{ background: 'var(--warm2)', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer', color: 'var(--ink2)' }}
            >
              {objetivosExpandido ? '⬆ Recolher' : '⬇ Ver todos'}
            </button>
          </div>
        </div>

        {/* Objetivos selecionados */}
        {form.objetivos?.length > 0 && (
          <div style={{ background: 'var(--sage-light)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sage-dark)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selecionados</div>
            {objetivosSelecionados.map(o => (
              <div key={o.codigo} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                <button onClick={() => toggleObjetivo(o.codigo)} style={{ background: 'var(--sage)', color: '#fff', border: 'none', borderRadius: 4, padding: '1px 6px', fontSize: 10, cursor: 'pointer', flexShrink: 0, fontWeight: 600 }}>✕</button>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sage-dark)' }}>{o.codigo}: </span>
                  <span style={{ fontSize: 11, color: 'var(--ink2)' }}>{o.texto}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista completa de objetivos */}
        {objetivosExpandido && (
          <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--warm3)', borderRadius: 8 }}>
            {form.camposExperiencia.length === 0 && (
              <div style={{ padding: 16, fontSize: 13, color: 'var(--ink3)', textAlign: 'center' }}>Selecione os campos de experiência acima</div>
            )}
            {form.camposExperiencia.map(sigla => {
              const campo = CAMPOS_EXPERIENCIA.find(c => c.sigla === sigla)
              const objetivos = (OBJETIVOS_APRENDIZAGEM[sigla] || []).filter(o => o.codigo.startsWith('EI03') || o.codigo.startsWith('EI02'))
              return (
                <div key={sigla}>
                  <div style={{ padding: '8px 12px', background: campo?.corLight, fontSize: 11, fontWeight: 600, color: campo?.cor, position: 'sticky', top: 0 }}>
                    {campo?.icon} {campo?.nome}
                  </div>
                  {objetivos.map(o => (
                    <div
                      key={o.codigo}
                      onClick={() => toggleObjetivo(o.codigo)}
                      style={{
                        padding: '8px 12px', cursor: 'pointer',
                        background: form.objetivos?.includes(o.codigo) ? campo?.corLight : '#fff',
                        borderBottom: '1px solid var(--warm3)',
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        transition: 'background 0.1s'
                      }}
                    >
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${form.objetivos?.includes(o.codigo) ? campo?.cor : 'var(--warm4)'}`, background: form.objetivos?.includes(o.codigo) ? campo?.cor : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        {form.objetivos?.includes(o.codigo) && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: campo?.cor }}>{o.codigo}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.4 }}>{o.texto}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button
          className="btn btn-primary"
          onClick={() => onSave({ ...form, id: inicial?.id || Date.now(), tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags })}
        >
          💾 Salvar atividade
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────
export default function BancoAtividades({ onAlocarNoPlanejamento }) {
  const [atividades, setAtividades] = useState(ATIVIDADES_EXEMPLO)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [filtros, setFiltros] = useState({ tipo: '', campo: '', mes: '', busca: '', projeto: '' })
  const [selecionadas, setSelecionadas] = useState([])
  const [modoSelecao, setModoSelecao] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  function toast(msg) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

  const projetos = [...new Set(atividades.filter(a => a.projeto).map(a => a.projeto))]

  const atividadesFiltradas = useMemo(() => {
    return atividades.filter(a => {
      if (filtros.tipo && a.tipo !== filtros.tipo) return false
      if (filtros.campo && !a.camposExperiencia?.includes(filtros.campo)) return false
      if (filtros.mes && a.mes !== Number(filtros.mes)) return false
      if (filtros.projeto && a.projeto !== filtros.projeto) return false
      if (filtros.busca) {
        const q = filtros.busca.toLowerCase()
        return a.titulo?.toLowerCase().includes(q) || a.descricao?.toLowerCase().includes(q) || a.tags?.some(t => t.toLowerCase().includes(q))
      }
      return true
    })
  }, [atividades, filtros])

  function handleSave(ativ) {
    if (editando) {
      setAtividades(p => p.map(a => a.id === ativ.id ? ativ : a))
      toast('✅ Atividade atualizada!')
    } else {
      setAtividades(p => [...p, ativ])
      toast('✅ Atividade cadastrada no banco!')
    }
    setShowForm(false)
    setEditando(null)
  }

  function toggleSelecao(ativ) {
    setSelecionadas(p => p.find(a => a.id === ativ.id) ? p.filter(a => a.id !== ativ.id) : [...p, ativ])
  }

  // Estatísticas do banco
  const stats = useMemo(() => ({
    total: atividades.length,
    campos: CAMPOS_EXPERIENCIA.map(c => ({
      ...c,
      count: atividades.filter(a => a.camposExperiencia?.includes(c.sigla)).length
    })),
    porMes: MESES.map((m, i) => atividades.filter(a => a.mes === i + 1).length)
  }), [atividades])

  return (
    <div className="page-wrap">
      {toastMsg && <div className="toast">✅ {toastMsg}</div>}

      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">🗂️</span> Banco de Atividades</div>
          <div className="page-subtitle">Cadastre uma vez, use o ano todo — com sugestões BNCC por IA</div>
        </div>
        <div className="header-actions">
          {modoSelecao && selecionadas.length > 0 && (
            <button className="btn btn-terra btn-sm" onClick={() => { onAlocarNoPlanejamento?.(selecionadas); toast(`${selecionadas.length} atividades enviadas ao planejamento!`) }}>
              📅 Alocar no planejamento ({selecionadas.length})
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => { setModoSelecao(!modoSelecao); setSelecionadas([]) }}>
            {modoSelecao ? '✕ Cancelar seleção' : '📅 Selecionar para planejamento'}
          </button>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditando(null) }}>
            + Nova Atividade
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
        {stats.campos.map(c => (
          <div key={c.sigla} style={{ background: c.corLight, borderRadius: 10, padding: '12px 14px', border: `1px solid ${c.cor}20` }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: c.cor, fontWeight: 400 }}>{c.count}</div>
            <div style={{ fontSize: 10, color: c.cor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.3, marginTop: 2 }}>{c.sigla}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      {(showForm || editando) && (
        <div style={{ marginBottom: 24 }}>
          <AtividadeForm
            inicial={editando}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditando(null) }}
          />
        </div>
      )}

      {/* Filtros */}
      <div style={{ background: '#fff', border: '1px solid var(--warm3)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" style={{ flex: 2, minWidth: 180 }} placeholder="🔍 Buscar por título, descrição ou tag..." value={filtros.busca} onChange={e => setFiltros(p => ({ ...p, busca: e.target.value }))} />
        <select className="form-input" style={{ flex: 1, minWidth: 140 }} value={filtros.tipo} onChange={e => setFiltros(p => ({ ...p, tipo: e.target.value }))}>
          <option value="">Todos os tipos</option>
          {TIPOS_ATIVIDADE.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
        </select>
        <select className="form-input" style={{ flex: 1, minWidth: 140 }} value={filtros.campo} onChange={e => setFiltros(p => ({ ...p, campo: e.target.value }))}>
          <option value="">Todos os campos</option>
          {CAMPOS_EXPERIENCIA.map(c => <option key={c.sigla} value={c.sigla}>{c.icon} {c.nome}</option>)}
        </select>
        <select className="form-input" style={{ flex: 1, minWidth: 100 }} value={filtros.mes} onChange={e => setFiltros(p => ({ ...p, mes: e.target.value }))}>
          <option value="">Todos os meses</option>
          {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        {projetos.length > 0 && (
          <select className="form-input" style={{ flex: 1, minWidth: 140 }} value={filtros.projeto} onChange={e => setFiltros(p => ({ ...p, projeto: e.target.value }))}>
            <option value="">Todos os projetos</option>
            {projetos.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        <span style={{ fontSize: 12, color: 'var(--ink3)', whiteSpace: 'nowrap' }}>{atividadesFiltradas.length} de {atividades.length}</span>
      </div>

      {/* Grid de atividades */}
      {modoSelecao && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          📅 Modo seleção ativo — clique nas atividades para selecionar e depois "Alocar no planejamento"
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {atividadesFiltradas.map(ativ => (
          <AtividadeCard
            key={ativ.id}
            ativ={ativ}
            onEdit={!modoSelecao ? (a) => { setEditando(a); setShowForm(false) } : null}
            onSelect={modoSelecao ? toggleSelecao : null}
            selected={selecionadas.some(a => a.id === ativ.id)}
          />
        ))}
      </div>

      {atividadesFiltradas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗂️</div>
          <div style={{ fontSize: 15 }}>Nenhuma atividade encontrada.</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Clique em "+ Nova Atividade" para começar a construir o banco.</div>
        </div>
      )}
    </div>
  )
}
