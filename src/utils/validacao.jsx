// Sistema de validação e assistente de IA para o planejamento
// Garante que nenhuma educadora esqueça os campos obrigatórios

import { CAMPOS_EXPERIENCIA, OBJETIVOS_APRENDIZAGEM } from '../data/bncc.js'

// ─── Campos obrigatórios no padrão Micheline ────────────────
export const CAMPOS_OBRIGATORIOS = [
  { id: 'titulo', label: 'Título da atividade', exemplo: 'Ex: Bordado/Fuxico' },
  { id: 'tipo', label: 'Tipo (oficina, culinária, corpo e movimento...)' },
  { id: 'espaco', label: 'Espaço / Local', exemplo: 'Ex: (SALA DE AULA)' },
  { id: 'descricao', label: 'Descrição pedagógica', exemplo: 'O que as crianças farão e o que desenvolve' },
  { id: 'objetivos', label: 'Pelo menos 1 objetivo BNCC', exemplo: 'Ex: EI03TS02' },
  { id: 'camposExperiencia', label: 'Campo de Experiência BNCC' },
  { id: 'intencionalidade', label: 'O que a criança desenvolve', exemplo: '"A proposta favorece..."' },
]

export const CAMPOS_RECOMENDADOS = [
  { id: 'materiais', label: 'Materiais necessários' },
  { id: 'conexaoPesquisa', label: 'Conexão com a pesquisa vigente' },
  { id: 'inclusao', label: 'Adaptação para inclusão (se houver)' },
]

// ─── Validador de célula da grade ────────────────────────────
export function validarCelulaPlanejamento(texto) {
  if (!texto || texto.trim() === '' || texto === '...') {
    return { valido: false, status: 'vazio', faltando: CAMPOS_OBRIGATORIOS.map(c => c.label) }
  }

  const t = texto.toLowerCase()
  const faltando = []
  const avisos = []

  // Verifica objetivo BNCC
  const temBNCC = /EI0[123][A-Z]{2}\d{2}/.test(texto)
  if (!temBNCC) faltando.push('Objetivo BNCC (EI03XX00)')

  // Verifica campo de experiência
  const temCampo = /campo de experiência/i.test(texto) || /corpo, gestos/i.test(texto) || /escuta, fala/i.test(texto) || /espaços, tempos/i.test(texto) || /traços, sons/i.test(texto) || /eu, o outro/i.test(texto)
  if (!temCampo) faltando.push('Campo de Experiência BNCC')

  // Verifica descrição mínima (pelo menos 3 linhas ou 100 chars)
  const temDescricao = texto.length > 80
  if (!temDescricao) faltando.push('Descrição pedagógica (muito curta)')

  // Verifica intencionalidade
  const temIntencionalidade = /favorece|desenvolve|promove|estimula|proporciona|permite|possibilita/i.test(texto)
  if (!temIntencionalidade) avisos.push('Sem intencionalidade explícita ("A proposta favorece...")')

  // Verifica espaço/local
  const temEspaco = /\(.*\)|sala|parque|gramado|cozinha|ateliê|quadra|refeitório/i.test(texto)
  if (!temEspaco) avisos.push('Espaço/local não identificado')

  const valido = faltando.length === 0

  return {
    valido,
    status: valido ? (avisos.length > 0 ? 'aviso' : 'ok') : 'incompleto',
    faltando,
    avisos
  }
}

// ─── Validador completo do planejamento semanal ──────────────
export function validarPlanejamentoCompleto(slots) {
  const slotPrincipal = slots.find(s => s.principal)
  if (!slotPrincipal) return { valido: false, erros: ['Grade sem horário principal (9h10)'] }

  const erros = []
  const avisos = []
  const diasNomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

  slotPrincipal.cells.forEach((cell, i) => {
    const resultado = validarCelulaPlanejamento(cell)
    if (!resultado.valido) {
      resultado.faltando.forEach(f => erros.push(`${diasNomes[i]}: falta ${f}`))
    }
    resultado.avisos?.forEach(a => avisos.push(`${diasNomes[i]}: ${a}`))
  })

  return { valido: erros.length === 0, erros, avisos }
}

// ─── IA: Completar célula no padrão Micheline ────────────────
export async function completarCelulaComIA(titulo, tipo, espaco, contexto) {
  const prompt = `Você é especialista em educação infantil, abordagem Reggio Emilia e BNCC.

Preencha esta célula de planejamento pedagógico no mesmo padrão da professora Micheline do Colégio Nacional:

TÍTULO DA ATIVIDADE: ${titulo}
TIPO: ${tipo || 'não informado'}
ESPAÇO: ${espaco || 'a definir'}
CONTEXTO DA SEMANA: ${contexto || 'Período integral, Educação Infantil, Colégio Nacional'}

FORMATO EXATO A SEGUIR (idêntico ao padrão Micheline):
[TÍTULO EM MAIÚSCULAS]
([ESPAÇO EM MAIÚSCULAS])
[Subtítulo descritivo se houver]

[Parágrafo 1 — O que as crianças farão concretamente, com detalhes do espaço e materiais. 2-3 frases.]

[Parágrafo 2 — O que essa proposta desenvolve: habilidades, competências, conexão com a pesquisa vigente. 2-3 frases.]

EI03XX01: [descrição curta do objetivo]
EI03XX02: [descrição curta do objetivo]

Campo de Experiência: [nome completo do campo]/ [outro campo se houver]

REGRAS OBRIGATÓRIAS:
- Inclua SEMPRE pelo menos 2 códigos BNCC reais (EI03...) 
- Inclua SEMPRE o Campo de Experiência por extenso
- Inclua SEMPRE uma frase com "A proposta favorece..." ou "A atividade promove..."
- Linguagem pedagógica, respeitosa, criança como protagonista
- Máximo 180 palavras

Retorne APENAS o texto da célula, sem explicações adicionais.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    return data.content?.[0]?.text?.trim() || null
  } catch (e) {
    return null
  }
}

// ─── Componente: Indicador de status da célula ───────────────
export function CellStatusBadge({ texto, compact = false }) {
  const resultado = validarCelulaPlanejamento(texto)

  if (resultado.status === 'vazio') return null

  const configs = {
    ok: { bg: '#EAF3DE', color: '#27500A', icon: '✓', label: 'Completo' },
    aviso: { bg: '#FAEEDA', color: '#633806', icon: '⚠', label: 'Verificar' },
    incompleto: { bg: '#FCEBEB', color: '#791F1F', icon: '!', label: `Faltam ${resultado.faltando.length}` },
  }

  const c = configs[resultado.status]

  return (
    <div
      title={resultado.faltando.length > 0 ? `Faltando:\n${resultado.faltando.join('\n')}` : 'Célula completa'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: c.bg, color: c.color,
        padding: compact ? '1px 6px' : '2px 8px',
        borderRadius: 10, fontSize: 10, fontWeight: 600,
        cursor: 'help', userSelect: 'none'
      }}
    >
      {c.icon} {!compact && c.label}
    </div>
  )
}

// ─── Componente: Painel de validação completo ────────────────
export function PainelValidacao({ slots, onClose }) {
  const resultado = validarPlanejamentoCompleto(slots)

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--warm3)', borderRadius: 12,
      padding: 20, marginBottom: 16
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16 }}>
          {resultado.valido ? '✅ Planejamento completo' : '⚠️ Planejamento incompleto'}
        </div>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontSize: 16 }}>✕</button>}
      </div>

      {resultado.erros.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#791F1F', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            Campos obrigatórios faltando
          </div>
          {resultado.erros.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '7px 10px', background: '#FCEBEB', borderRadius: 6, marginBottom: 4, fontSize: 12 }}>
              <span style={{ color: '#A32D2D', fontWeight: 700, flexShrink: 0 }}>✗</span>
              <span style={{ color: '#501313' }}>{e}</span>
            </div>
          ))}
        </div>
      )}

      {resultado.avisos.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#633806', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            Recomendações
          </div>
          {resultado.avisos.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '7px 10px', background: '#FAEEDA', borderRadius: 6, marginBottom: 4, fontSize: 12 }}>
              <span style={{ color: '#854F0B', fontWeight: 700, flexShrink: 0 }}>⚠</span>
              <span style={{ color: '#412402' }}>{a}</span>
            </div>
          ))}
        </div>
      )}

      {resultado.valido && resultado.avisos.length === 0 && (
        <div style={{ padding: '10px 14px', background: '#EAF3DE', borderRadius: 8, fontSize: 13, color: '#173404' }}>
          Todos os campos obrigatórios preenchidos. Planejamento pronto para imprimir!
        </div>
      )}
    </div>
  )
}
