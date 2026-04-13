import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { ATIVIDADES_EXEMPLO, CAMPOS_EXPERIENCIA, OBJETIVOS_APRENDIZAGEM } from '../data/bncc.js'
import PrintPreview from '../components/PrintTemplate.jsx'
import { validarCelulaPlanejamento, PainelValidacao, completarCelulaComIA } from '../utils/validacao.jsx'

const SLOTS_BASE = [
  { h: '7h30', label: 'Chegada / Acolhimento', fixo: true },
  { h: '8:00h', label: 'Assembleia / Parque / Cuidar dos ambientes', fixo: false },
  { h: '8h40', label: 'Café da manhã (Refeitório)', fixo: true },
  { h: '9h10', label: 'Vivência / Pesquisa — ATIVIDADE PRINCIPAL', fixo: false, principal: true },
  { h: '10:00h', label: 'Banho / Troca / Higiene / Tarefa de casa', fixo: true },
  { h: '11:00h', label: 'Finalização de vivências pendentes', fixo: false },
  { h: '11h30', label: 'Almoço (Refeitório)', fixo: true },
  { h: '12h15', label: 'Escovação / Descanso / Agendas', fixo: true },
  { h: '12h45', label: 'Sala de referência', fixo: false },
]

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

async function gerarSugestaoSemana(slots, atividades, contexto) {
  const atividadesDisponiveis = atividades.map(a => `- ${a.titulo} (${a.tipo}, ${a.espaco}, campos: ${a.camposExperiencia.join(',')})`).join('\n')

  const prompt = `Você é especialista em planejamento pedagógico Reggio Emilia.

Dada a seguinte lista de atividades disponíveis no banco:
${atividadesDisponiveis}

Crie um planejamento semanal balanceado para 5 dias (seg-sex) no horário 9h10 (Vivência/Pesquisa).

CRITÉRIOS:
1. Variedade de campos de experiência ao longo da semana
2. Progressão pedagógica (investigação → aprofundamento → síntese)  
3. Alternância de espaços (sala, externo, cozinha, etc.)
4. Contexto: ${contexto || 'Educação Infantil período integral, foco atual: pesquisa dos ovos e confecção de fuxicos'}

Retorne SOMENTE um JSON assim:
{
  "seg": "título exato da atividade ou descrição curta",
  "ter": "título...",
  "qua": "título...",
  "qui": "título...",
  "sex": "título..."
}
Nenhum texto antes ou depois.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    const text = data.content?.[0]?.text || '{}'
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch (e) {
    return null
  }
}

// Verificar equilíbrio BNCC da semana
function analisarEquilibrioBNCC(slots, atividades) {
  const camposUsados = {}
  CAMPOS_EXPERIENCIA.forEach(c => { camposUsados[c.sigla] = 0 })

  slots.forEach(slot => {
    if (!slot.principal) return
    slot.cells.forEach((cell, i) => {
      if (i === 0 || !cell) return
      const ativ = atividades.find(a => cell.includes(a.titulo))
      ativ?.camposExperiencia?.forEach(c => { camposUsados[c] = (camposUsados[c] || 0) + 1 })
    })
  })

  return camposUsados
}


function EducadorasSelect({ tipo, selected, onChange }) {
  const { educadoras } = useApp()
  const filtradas = educadoras.filter(e => e.tipo === tipo || !tipo)
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 10px', border: '1px solid var(--warm3)', borderRadius: 8, background: '#fff', minHeight: 38 }}>
      {filtradas.map(e => {
        const sel = selected.includes(e.id) || selected.includes(e.nome)
        return (
          <button
            key={e.id}
            onClick={() => {
              const n = sel ? selected.filter(id => id !== e.id && id !== e.nome) : [...selected, e.id]
              onChange(n)
            }}
            style={{
              padding: '3px 10px', borderRadius: 14, fontSize: 12, cursor: 'pointer',
              border: sel ? '1.5px solid var(--sage)' : '1px solid var(--warm3)',
              background: sel ? 'var(--sage-light)' : '#fff',
              color: sel ? 'var(--sage-dark)' : 'var(--ink3)',
              fontWeight: sel ? 600 : 400,
            }}
          >{e.nome}</button>
        )
      })}
      {filtradas.length === 0 && <span style={{ fontSize: 12, color: 'var(--ink4)' }}>Nenhuma educadora cadastrada</span>}
    </div>
  )
}

export default function PlanejamentoInteligente() {
  const { educadoras, rotinaItems } = useApp()
  const [tab, setTab] = useState('semanal')
  const [meta, setMeta] = useState({
    semana: '2026-04-13', refIds: ['1','2','3'], apoioIds: ['4','5'],
    propostas: 'Daremos continuidade à pesquisa sobre os ovos, retomando com as crianças a experiência do ovo mergulhado no vinagre. Construção de mapa de palavras e linha do tempo com registros da experiência.', observacao: 'Manter cronograma do banho com revezamento de educadoras para não sobrecarregar. Nesta semana: Érica e Dayane.', revisao: '', ajustes: '', reflexao: '',
    // Override diário da equipe: { 0: { refIds: [...], apoioIds: [...] }, 1: {...} }
    equipeDiaria: {},
  })
  // Tarefas por célula: { "slotIdx-diaIdx": [{ educadoraId, tarefa, feito }] }
  const [tarefasPorCelula, setTarefasPorCelula] = useState({})
  // Modal de edição expandida
  const [modalCelula, setModalCelula] = useState(null)
  const [slots, setSlots] = useState(
    SLOTS_BASE.map((s, si) => {
      if (s.principal) {
        return { ...s, cells: [
          'JOGOS E BRINCADEIRAS\n(PARQUE, QUADRA, GRAMADO)\n\nParlenda\nAs crianças participarão de momentos de brincadeira cantada com a parlenda "A galinha do vizinho bota ovo amarelinho", explorando ritmo, memorização, oralidade e movimentos corporais. A proposta poderá ser acompanhada de gestos, roda e dramatizações, favorecendo a interação e a ludicidade.\n\nEI03EF01: Expressar ideias, desejos e sentimentos por meio da linguagem oral.\n\nCampo de Experiência: Escuta, fala, pensamento e imaginação',
          'OFICINA\n(SALA DE AULA)\nBordado/Fuxico\n\nDando continuidade à oficina de costura, as crianças seguirão com a confecção dos fuxicos para a ornamentação da festa junina. A atividade promove concentração, persistência, coordenação motora fina e valorização do processo coletivo de criação.\n\nEI03TS02: Utilizar materiais variados para criar objetos.\nEI03CG05: Desenvolver progressivamente habilidades manuais.\n\nCampo de Experiência: Corpo, gestos e movimentos/ Traços, sons, cores e formas',
          'LINGUAGEM PLÁSTICA\n(MESAS VERMELHAS)\nDesenho/Hipóteses\n\nAs crianças serão convidadas a representar, por meio do desenho, os animais que colocam ovos, considerando as hipóteses levantadas na roda de conversa inicial da pesquisa. Poderão expressar ideias, conhecimentos prévios e ampliar repertórios por meio da linguagem artística.\n\nEI03TS01: Explorar diferentes materiais e formas de expressão.\nEI03EF01: Expressar ideias e hipóteses em diferentes linguagens.\n\nCampo de Experiência: Traços, sons, cores e formas/ Escuta, fala, pensamento e imaginação',
          'CULINÁRIA\n(COZINHA EXPERIMENTAL)\nMini Donuts\n\nAs crianças participarão do preparo de mini donuts utilizando ovos colhidos no galinheiro da escola. Irão acompanhar as etapas da receita, observar ingredientes, colaborar com o grupo e relacionar o alimento à pesquisa em andamento.\n\nEI03ET03: Estabelecer relações entre o preparo e o consumo de alimentos.\nEI03EO03: Participar de atividades coletivas, respeitando combinados e colaborando.\n\nCampo de Experiência: Espaços, tempos, quantidades, relações e transformações/ O eu, o outro e o nós',
          'CORPO E MOVIMENTO\n(GRAMADO)\nAmarelinha Africana\n\nAs crianças participarão da brincadeira Amarelinha Africana, explorando movimentos coordenados, ritmo, lateralidade, equilíbrio e atenção. A proposta amplia repertórios culturais e favorece desafios corporais de forma lúdica e coletiva.\n\nEI03CG02: Demonstrar controle e adequação do uso do corpo em brincadeiras.\nEI03CG04: Adotar hábitos de autocuidado relacionados ao corpo e ao bem-estar.\n\nCampo de Experiência: Corpo, gestos e movimentos',
        ]}
      }
      return { ...s, cells: ['', '', '', '', ''].map(() => s.fixo ? s.label.split('(')[0].trim() : '') }
    })
  )
  const [showPrint, setShowPrint] = useState(false)
  const [showBanco, setShowBanco] = useState(false)
  const [slotParaAlocar, setSlotParaAlocar] = useState(null)
  const [loadingIA, setLoadingIA] = useState(false)
  const [contextoIA, setContextoIA] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const atividades = ATIVIDADES_EXEMPLO
  const equilibrio = useMemo(() => analisarEquilibrioBNCC(slots, atividades), [slots, atividades])

  const [showValidacao, setShowValidacao] = useState(false)
  const [loadingCelula, setLoadingCelula] = useState(null)

  function toast(msg) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

  async function handleCompletarCelula(si, di, cell) {
    setLoadingCelula(`${si}-${di}`)
    toast('Gerando no padrão Micheline...')
    const linhas = (cell || '').split('\n')
    const titulo = linhas[0] || 'Atividade'
    const conteudo = await completarCelulaComIA(titulo, '', '', contextoIA || 'Período integral, Educação Infantil, Colégio Nacional, pesquisa dos ovos')
    if (conteudo) { updateCell(si, di, conteudo); toast('Completado no padrão Micheline!') }
    else toast('Erro ao completar. Tente novamente.')
    setLoadingCelula(null)
  }

  function handleImprimir() {
    const slotP = slots.find(s => s.principal)
    if (slotP) {
      const temIncompleto = slotP.cells.some(c => c && c !== '...' && !validarCelulaPlanejamento(c).valido)
      if (temIncompleto) { setShowValidacao(true); toast('Há campos obrigatórios faltando!'); return }
    }
    setShowPrint(true)
  }

  function updateCell(slotIdx, diaIdx, val) {
    setSlots(prev => {
      const n = [...prev]
      n[slotIdx] = { ...n[slotIdx], cells: n[slotIdx].cells.map((c, i) => i === diaIdx ? val : c) }
      return n
    })
  }

  function alocarAtividade(ativ, diaIdx) {
    const slotIdx = slots.findIndex(s => s.principal)
    if (slotIdx >= 0) {
      const desc = `${ativ.titulo.toUpperCase()}\n(${ativ.espaco.toUpperCase()})\n${ativ.descricao.substring(0, 200)}${ativ.descricao.length > 200 ? '...' : ''}\n\n${ativ.objetivos?.join(' · ')}`
      updateCell(slotIdx, diaIdx, desc)
      toast(`✅ "${ativ.titulo}" alocada na ${DIAS[diaIdx]}!`)
    }
    setShowBanco(false)
    setSlotParaAlocar(null)
  }

  async function handleGerarSemana() {
    setLoadingIA(true)
    toast('🤖 IA está montando o planejamento...')
    const sugestao = await gerarSugestaoSemana(slots, atividades, contextoIA)
    if (sugestao) {
      const slotIdx = slots.findIndex(s => s.principal)
      const dias = ['seg', 'ter', 'qua', 'qui', 'sex']
      if (slotIdx >= 0) {
        setSlots(prev => {
          const n = [...prev]
          const novaCells = [...n[slotIdx].cells]
          dias.forEach((d, i) => {
            if (sugestao[d]) novaCells[i] = sugestao[d]
          })
          n[slotIdx] = { ...n[slotIdx], cells: novaCells }
          return n
        })
        toast('✅ Planejamento gerado pela IA! Revise e ajuste.')
      }
    } else {
      toast('⚠️ Erro ao gerar. Configure a API key.')
    }
    setLoadingIA(false)
  }

  const dadosImpressao = useMemo(() => ({
    semana: meta.semana,
    educadorasRef: meta.ref,
    educadorasApoio: meta.apoio,
    slots: slots.map(s => ({ h: s.h, cells: [s.label, ...s.cells] })),
    propostas: meta.propostas,
    observacao: meta.observacao,
    revisao: meta.revisao,
    ajustes: meta.ajustes,
    reflexao: meta.reflexao
  }), [meta, slots])

  return (
    <div className="page-wrap">
      {toastMsg && <div className="toast">✅ {toastMsg}</div>}
      {showPrint && <PrintPreview dados={dadosImpressao} onClose={() => setShowPrint(false)} />}

      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">📅</span> Planejamento</div>
          <div className="page-subtitle">Construído a partir do Banco de Atividades + assistente BNCC</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowBanco(!showBanco)}>🗂️ Banco de Atividades</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPrint(true)}>👁️ Prévia / Imprimir</button>
        </div>
      </div>

      <div className="tabs">
        {['anual','trimestral','mensal','semanal'].map(t => (
          <button key={t} className={`tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'semanal' && (
        <div>
          {/* Painel IA */}
          <div style={{ background: 'var(--sage-dark)', borderRadius: 'var(--r)', padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontFamily: 'Fraunces, serif', fontSize: 15, marginBottom: 4 }}>✨ Gerar semana com IA</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>A IA aloca atividades do banco garantindo variedade de campos de experiência</div>
            </div>
            <input
              style={{ flex: 2, padding: '9px 14px', borderRadius: 8, border: 'none', fontSize: 12, minWidth: 200, fontFamily: 'DM Sans, sans-serif' }}
              placeholder="Contexto (ex: continuando pesquisa dos ovos, preparação festa junina...)"
              value={contextoIA}
              onChange={e => setContextoIA(e.target.value)}
            />
            <button
              onClick={handleGerarSemana}
              disabled={loadingIA}
              style={{ background: loadingIA ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}
            >
              {loadingIA ? '⏳ Gerando...' : '🤖 Gerar semana'}
            </button>
          </div>

          {/* Metadados */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Semana (início)</label>
                <input type="date" className="form-input" value={meta.semana} onChange={e => setMeta(p => ({ ...p, semana: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Educadoras de referência</label>
                <EducadorasSelect
                  tipo="Referência"
                  selected={meta.refIds || []}
                  onChange={ids => setMeta(p => ({ ...p, refIds: ids }))}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Educadoras de apoio</label>
                <EducadorasSelect
                  tipo="Apoio"
                  selected={meta.apoioIds || []}
                  onChange={ids => setMeta(p => ({ ...p, apoioIds: ids }))}
                />
              </div>
            </div>
          </div>

          {/* Rotina fixa por dia */}
          <div className="card" style={{ marginBottom: 16, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📌 Rotina fixa da semana
              </div>
              <span style={{ fontSize: 10, color: 'var(--ink4)', fontStyle: 'italic' }}>configurada em "Rotina do Dia"</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink4)', marginBottom: 10 }}>
              Estes itens entram automaticamente no Registro do Dia — não precisam ser repetidos no quadro abaixo.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(diaId => {
                const itensDoDia = rotinaItems.filter(it => (it.dias || []).includes(diaId))
                return (
                  <div key={diaId} style={{ background: 'var(--warm)', border: '1px solid var(--warm3)', borderRadius: 8, padding: '8px 10px', minHeight: 60 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                      {DIAS[diaId - 1]}
                    </div>
                    {itensDoDia.length === 0 && <div style={{ fontSize: 10, color: 'var(--ink4)', fontStyle: 'italic' }}>—</div>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {itensDoDia.map(it => (
                        <span key={it.id} title={it.label} style={{ fontSize: 11, padding: '2px 7px', background: '#fff', border: '1px solid var(--warm3)', borderRadius: 10, color: 'var(--ink2)', whiteSpace: 'nowrap' }}>
                          {it.icon} {it.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Equipe do dia (override) */}
          <div className="card" style={{ marginBottom: 16, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              👥 Equipe efetiva do dia
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink4)', marginBottom: 10 }}>
              Padrão = equipe da semana. Ajuste aqui caso alguém tenha faltado ou sido substituído em um dia específico.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {DIAS.map((dia, di) => {
                const over = meta.equipeDiaria?.[di]
                const refIds = over?.refIds ?? meta.refIds ?? []
                const apoioIds = over?.apoioIds ?? meta.apoioIds ?? []
                const nomes = educadoras
                  .filter(e => refIds.includes(e.id) || refIds.includes(e.nome) || apoioIds.includes(e.id) || apoioIds.includes(e.nome))
                  .map(e => e.nome)
                return (
                  <button key={dia} type="button"
                    onClick={() => setModalCelula({ si: -1, di, modo: 'equipe' })}
                    style={{ background: over ? '#faeeda' : 'var(--warm)', border: `1px solid ${over ? '#FAC775' : 'var(--warm3)'}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: over ? '#633806' : 'var(--ink2)', marginBottom: 4 }}>
                      {dia}{over && ' ✎'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--ink3)', lineHeight: 1.35 }}>
                      {nomes.length > 0 ? nomes.join(', ') : 'Sem equipe definida'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Equilíbrio BNCC */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {CAMPOS_EXPERIENCIA.map(c => (
              <div key={c.sigla} style={{ background: equilibrio[c.sigla] > 0 ? c.corLight : 'var(--warm2)', border: `1px solid ${equilibrio[c.sigla] > 0 ? c.cor : 'var(--warm3)'}`, borderRadius: 20, padding: '4px 12px', fontSize: 11, color: equilibrio[c.sigla] > 0 ? c.cor : 'var(--ink4)', fontWeight: equilibrio[c.sigla] > 0 ? 600 : 400 }}>
                {c.icon} {c.sigla} {equilibrio[c.sigla] > 0 ? `×${equilibrio[c.sigla]}` : '—'}
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'var(--ink3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Campos cobertos esta semana
            </div>
          </div>

          {/* Grade */}
          <div style={{ overflowX: 'auto' }}>
            <table className="plan-table">
              <thead>
                <tr>
                  <th style={{ width: 72 }}>Horário</th>
                  {DIAS.map((d, i) => {
                    const cores = [['#2e7d4e','#fff'],['#1565c0','#fff'],['#6a1b9a','#fff'],['#e65100','#fff'],['#c62828','#fff']]
                    return <th key={d} style={{ background: cores[i][0], color: cores[i][1] }}>{d}</th>
                  })}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, si) => (
                  <tr key={si}>
                    <td style={{ background: 'var(--warm2)', fontWeight: 600, fontSize: 10, textAlign: 'center', color: 'var(--ink2)', fontStyle: 'italic' }}>{slot.h}</td>
                    {slot.cells.map((cell, di) => {
                      const validacao = slot.principal ? validarCelulaPlanejamento(cell) : null
                      const isLoading = loadingCelula === `${si}-${di}`
                      const borderColor = validacao && cell && cell !== '...'
                        ? (validacao.valido ? '#c5d9c9' : validacao.status === 'aviso' ? '#FAC775' : '#F09595')
                        : undefined
                      return (
                        <td key={di} style={{ padding: 0, position: 'relative', background: slot.principal ? '#f0f7f2' : undefined, border: borderColor ? `2px solid ${borderColor}` : undefined }}>
                          {slot.principal && !cell && (
                            <div
                              onClick={() => { setSlotParaAlocar({ si, di }); setShowBanco(true) }}
                              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--sage)', fontSize: 11, fontWeight: 500, opacity: 0.6, flexDirection: 'column', gap: 4 }}
                            >
                              <span>+ Do banco</span>
                            </div>
                          )}
                          <textarea
                            className="plan-cell"
                            value={cell}
                            onChange={e => updateCell(si, di, e.target.value)}
                            placeholder={slot.fixo ? slot.label : (slot.principal ? 'Digite o título ou use o banco...' : '...')}
                            style={{ minHeight: slot.principal ? 100 : 52, paddingBottom: slot.principal && cell ? 28 : undefined }}
                          />
                          {slot.principal && cell && cell.trim() !== '...' && (
                            <div style={{ position: 'absolute', bottom: 4, left: 4, right: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
                              {validacao && (
                                <span style={{
                                  fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8,
                                  background: validacao.valido ? '#EAF3DE' : validacao.status === 'aviso' ? '#FAEEDA' : '#FCEBEB',
                                  color: validacao.valido ? '#27500A' : validacao.status === 'aviso' ? '#633806' : '#791F1F',
                                  cursor: 'help',
                                  flexShrink: 0
                                }} title={validacao.faltando?.join(', ') || 'OK'}>
                                  {validacao.valido ? '✓ OK' : validacao.status === 'aviso' ? `⚠ ${validacao.avisos?.length}` : `✗ ${validacao.faltando?.length} faltando`}
                                </span>
                              )}
                              <button
                                onClick={() => setModalCelula({ si, di })}
                                style={{ fontSize: 9, padding: '1px 7px', borderRadius: 8, border: 'none', background: '#fff', color: 'var(--ink2)', cursor: 'pointer', fontWeight: 600, flexShrink: 0, marginLeft: 'auto', border: '1px solid var(--warm3)' }}
                                title="Expandir para edição completa"
                              >
                                ✏️ Expandir
                              </button>
                              <button
                                onClick={() => handleCompletarCelula(si, di, cell)}
                                disabled={isLoading}
                                style={{ fontSize: 9, padding: '1px 7px', borderRadius: 8, border: 'none', background: isLoading ? '#e0e0e0' : 'var(--sage)', color: '#fff', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}
                                title="Completar com IA no padrão Micheline"
                              >
                                {isLoading ? '...' : '✨ IA'}
                              </button>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setSlots(p => [...p, { h: '', label: '', fixo: false, cells: ['','','','',''] }])}>
            + Adicionar horário
          </button>

          {/* Campos de texto */}
          <div className="grid-2" style={{ marginTop: 20 }}>
            {[
              ['propostas','PROPOSTAS da semana','Vivências, pesquisas, projetos previstos...'],
              ['observacao','OBSERVAÇÃO','Revezamento de educadoras, agendas, avisos...'],
              ['revisao','Revisão semanal','O que foi realizado...'],
              ['ajustes','Ajustes necessários','O que mudar...'],
            ].map(([k,l,ph]) => (
              <div className="form-group" key={k}>
                <label className="form-label">{l}</label>
                <textarea className="form-input" placeholder={ph} value={meta[k]} onChange={e => setMeta(p => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">💭 Reflexão da professora ao final da semana</label>
              <textarea className="form-input" style={{ minHeight: 80 }} placeholder="Como foi a semana? O que te surpreendeu? O que fica para a próxima?" value={meta.reflexao} onChange={e => setMeta(p => ({ ...p, reflexao: e.target.value }))} />
            </div>
          </div>

          {showValidacao && <PainelValidacao slots={slots} onClose={() => setShowValidacao(false)} />}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={() => toast('Salvo!')}>💾 Salvar</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowValidacao(!showValidacao)}>🔍 Validar</button>
            <button className="btn btn-ghost btn-sm" onClick={handleImprimir}>👁 Prévia e Imprimir</button>
          </div>
        </div>
      )}

      {tab !== 'semanal' && (
        <div className="card">
          <div className="card-title">{tab === 'anual' ? 'Planejamento Anual 2026' : tab === 'trimestral' ? 'Planejamento Trimestral' : 'Planejamento Mensal'}</div>
          <div className="form-group"><label className="form-label">{tab === 'anual' ? 'Eixos de investigação' : tab === 'trimestral' ? 'Nome do projeto' : 'Tema do mês'}</label><textarea className="form-input" style={{ minHeight: 80 }} /></div>
          <div className="form-group"><label className="form-label">{tab === 'anual' ? 'Objetivos gerais' : tab === 'trimestral' ? 'Perguntas norteadoras' : 'Propostas possíveis'}</label><textarea className="form-input" /></div>
          <button className="btn btn-primary btn-sm" onClick={() => toast('Salvo!')}>💾 Salvar</button>
        </div>
      )}

      {/* Modal: edição expandida de célula / equipe do dia */}
      {modalCelula && (() => {
        const { si, di, modo } = modalCelula
        const isEquipeOnly = modo === 'equipe' || si === -1
        const slot = si >= 0 ? slots[si] : null
        const cellValue = slot ? slot.cells[di] : ''
        const chave = `${si}-${di}`
        const tarefas = tarefasPorCelula[chave] || []
        const overDia = meta.equipeDiaria?.[di]
        const refAtivos = overDia?.refIds ?? meta.refIds ?? []
        const apoioAtivos = overDia?.apoioIds ?? meta.apoioIds ?? []
        const setEquipeDia = (patch) => setMeta(p => ({ ...p, equipeDiaria: { ...(p.equipeDiaria || {}), [di]: { refIds: refAtivos, apoioIds: apoioAtivos, ...(p.equipeDiaria?.[di] || {}), ...patch } } }))
        const limparOverride = () => setMeta(p => { const n = { ...(p.equipeDiaria || {}) }; delete n[di]; return { ...p, equipeDiaria: n } })
        const addTarefa = () => setTarefasPorCelula(p => ({ ...p, [chave]: [...(p[chave] || []), { id: Date.now().toString(), educadoraId: '', tarefa: '', feito: false, obs: '' }] }))
        const updTarefa = (idx, patch) => setTarefasPorCelula(p => ({ ...p, [chave]: p[chave].map((t, i) => i === idx ? { ...t, ...patch } : t) }))
        const rmTarefa = (idx) => setTarefasPorCelula(p => ({ ...p, [chave]: p[chave].filter((_, i) => i !== idx) }))
        const equipeIds = [...refAtivos, ...apoioAtivos]
        const equipeEducadoras = educadoras.filter(e => equipeIds.includes(e.id) || equipeIds.includes(e.nome))

        return (
          <div className="modal-overlay" onClick={() => setModalCelula(null)}>
            <div className="modal" style={{ maxWidth: 780 }} onClick={e => e.stopPropagation()}>
              <div className="modal-title">
                {isEquipeOnly ? `👥 Equipe do dia — ${DIAS[di]}` : `✏️ Edição da atividade — ${DIAS[di]}`}
              </div>

              {!isEquipeOnly && (
                <div className="form-group">
                  <label className="form-label">Descrição completa da atividade</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: 260, fontFamily: 'DM Sans, sans-serif', fontSize: 13, lineHeight: 1.6 }}
                    value={cellValue}
                    onChange={e => updateCell(si, di, e.target.value)}
                    placeholder="Título, espaço, descrição, objetivos BNCC, campos de experiência..."
                  />
                  <div style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 4 }}>
                    Dica: mantenha a estrutura — TÍTULO / (ESPAÇO) / descrição / objetivos / campos de experiência.
                  </div>
                </div>
              )}

              {/* Equipe do dia */}
              <div style={{ background: 'var(--warm)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginBottom: 8 }}>👥 Equipe efetiva no dia</div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 4 }}>Referência</div>
                  <EducadorasSelect tipo="Referência" selected={refAtivos} onChange={ids => setEquipeDia({ refIds: ids })} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 4 }}>Apoio</div>
                  <EducadorasSelect tipo="Apoio" selected={apoioAtivos} onChange={ids => setEquipeDia({ apoioIds: ids })} />
                </div>
                {overDia && (
                  <button className="btn btn-ghost btn-xs" onClick={limparOverride}>
                    ↺ Voltar para equipe padrão da semana
                  </button>
                )}
              </div>

              {/* Tarefas por educadora */}
              {!isEquipeOnly && (
                <div style={{ background: 'var(--warm)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>📋 Tarefas por educadora / apoio</div>
                    <button className="btn btn-ghost btn-xs" onClick={addTarefa}>+ Tarefa</button>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink4)', marginBottom: 10 }}>
                    Defina o que cada pessoa faz nesta atividade. Ao final, marque se foi cumprido — alimenta o relatório de participação.
                  </div>
                  {tarefas.length === 0 && <div style={{ fontSize: 12, color: 'var(--ink4)', fontStyle: 'italic' }}>Nenhuma tarefa definida ainda.</div>}
                  {tarefas.map((t, i) => (
                    <div key={t.id} style={{ background: '#fff', borderRadius: 6, padding: 10, marginBottom: 8, border: `1px solid ${t.feito ? '#c5d9c9' : 'var(--warm3)'}` }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <input type="checkbox" checked={t.feito} onChange={e => updTarefa(i, { feito: e.target.checked })} style={{ marginTop: 4 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                            <select className="form-input" style={{ flex: 1, fontSize: 12 }} value={t.educadoraId} onChange={e => updTarefa(i, { educadoraId: e.target.value })}>
                              <option value="">— selecione —</option>
                              {equipeEducadoras.map(e => <option key={e.id} value={e.id}>{e.nome} ({e.tipo})</option>)}
                            </select>
                            <button className="btn btn-ghost btn-xs" onClick={() => rmTarefa(i)}>Remover</button>
                          </div>
                          <input
                            className="form-input"
                            style={{ fontSize: 12, marginBottom: 6, textDecoration: t.feito ? 'line-through' : 'none', color: t.feito ? 'var(--ink4)' : 'var(--ink2)' }}
                            value={t.tarefa}
                            onChange={e => updTarefa(i, { tarefa: e.target.value })}
                            placeholder="O que esta pessoa vai fazer durante a atividade"
                          />
                          {t.feito !== undefined && (
                            <input
                              className="form-input"
                              style={{ fontSize: 11, padding: '6px 10px' }}
                              value={t.obs}
                              onChange={e => updTarefa(i, { obs: e.target.value })}
                              placeholder="Observação final (opcional): como foi, por que não cumpriu..."
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="modal-actions">
                <button className="btn btn-primary btn-sm" onClick={() => setModalCelula(null)}>Fechar</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Painel lateral: banco de atividades para alocar */}
      {showBanco && (
        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 380, background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)', zIndex: 500, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--warm3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16 }}>🗂️ Banco de Atividades</div>
            <button onClick={() => setShowBanco(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--ink3)' }}>✕</button>
          </div>
          {slotParaAlocar && (
            <div style={{ padding: '8px 16px', background: 'var(--sage-light)', fontSize: 12, color: 'var(--sage-dark)', fontWeight: 500 }}>
              Alocando na: {DIAS[slotParaAlocar.di]}
            </div>
          )}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {atividades.map(ativ => {
              const tipo = [
                { id: 'vivencia_pesquisa', icon: '🔍', cor: '#4a7c59' },
                { id: 'culinaria', icon: '🍳', cor: '#c4714a' },
                { id: 'linguagem_plastica', icon: '🎨', cor: '#6b4e71' },
                { id: 'corpo_movimento', icon: '🏃', cor: '#185fa5' },
                { id: 'oficina', icon: '✂️', cor: '#b8923a' },
                { id: 'jogos', icon: '🎮', cor: '#185fa5' },
              ].find(t => t.id === ativ.tipo) || { icon: '⭐', cor: '#888' }

              return (
                <div
                  key={ativ.id}
                  onClick={() => slotParaAlocar ? alocarAtividade(ativ, slotParaAlocar.di) : null}
                  style={{ background: 'var(--warm)', borderRadius: 'var(--r2)', padding: '12px 14px', cursor: slotParaAlocar ? 'pointer' : 'default', border: '1px solid var(--warm3)', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--warm3)'}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{tipo.icon}</span>
                    <div style={{ fontWeight: 500, fontSize: 13, color: tipo.cor }}>{ativ.titulo}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ativ.descricao}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink4)', marginTop: 4 }}>📍 {ativ.espaco} · {ativ.camposExperiencia?.join(', ')}</div>
                  {slotParaAlocar && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--sage)', fontWeight: 500 }}>Clique para alocar →</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
