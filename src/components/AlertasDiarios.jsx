import { useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }

const DIAS_SEMANA_ID = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb' }

export default function AlertasDiarios({ setPage }) {
  const { children, registros } = useApp()
  const hoje = new Date().toISOString().split('T')[0]
  const diaSemana = new Date().getDay()

  const chamada = lsGet('integral_chamada', {})
  const chamadaHoje = chamada[hoje] || {}
  const ocorrencias = lsGet('integral_ocorrencias', [])
  const planejamentos = lsGet('integral_planejamentos', [])
  const feriados = lsGet('integral_feriados', [])
  const eventos = lsGet('integral_eventos', [])

  const alertas = useMemo(() => {
    const lista = []

    // Feriado hoje
    const feriadoHoje = feriados.find(f => f.data === hoje)
    if (feriadoHoje) {
      lista.push({
        id: 'feriado',
        tipo: 'info',
        icon: '🎉',
        titulo: `Hoje é feriado — ${feriadoHoje.nome}`,
        descricao: `Feriado ${feriadoHoje.tipo || 'registrado'}${feriadoHoje.descricao ? ` · ${feriadoHoje.descricao}` : ''}`,
        acao: 'calendario',
        acaoLabel: 'Ver calendário',
      })
    }

    // Eventos hoje ou em andamento
    const eventosHoje = eventos.filter(ev => {
      const ini = ev.data_inicio
      const fim = ev.data_fim || ev.data_inicio
      return ini && hoje >= ini && hoje <= fim
    })
    if (eventosHoje.length > 0) {
      lista.push({
        id: 'eventos',
        tipo: 'aviso',
        icon: '📅',
        titulo: `${eventosHoje.length === 1 ? 'Evento' : `${eventosHoje.length} eventos`} hoje`,
        descricao: eventosHoje.map(ev => `"${ev.titulo}"${ev.local ? ` · ${ev.local}` : ''}`).join(' · '),
        acao: 'calendario',
        acaoLabel: 'Ver programação',
      })
    }

    const esperadas = children.filter(c => !c.data_saida && c.ativo !== false && (c.frequencia_atual?.dias || [1, 2, 3, 4, 5]).includes(diaSemana))
    const semMarcacao = esperadas.filter(c => !chamadaHoje[c.id])
    if (semMarcacao.length > 0 && diaSemana !== 0 && diaSemana !== 6) {
      lista.push({
        id: 'chamada',
        tipo: 'urgente',
        icon: '🧒',
        titulo: `Chamada pendente — ${semMarcacao.length} criança(s)`,
        descricao: semMarcacao.map(c => c.nome).join(', '),
        acao: 'criancas',
        acaoLabel: 'Fazer chamada',
      })
    }

    const naoEsperadas = children.filter(c => !c.data_saida && c.ativo !== false && !(c.frequencia_atual?.dias || [1, 2, 3, 4, 5]).includes(diaSemana))
    const extrasHoje = naoEsperadas.filter(c => chamadaHoje[c.id] === 'presente')
    if (extrasHoje.length > 0) {
      lista.push({
        id: 'extras',
        tipo: 'aviso',
        icon: '⚠️',
        titulo: `Dia não programado — ${extrasHoje.length} criança(s)`,
        descricao: `${extrasHoje.map(c => c.nome).join(', ')} vieram hoje (${DIAS_SEMANA_ID[diaSemana]}) mas não tinham este dia no contrato`,
        acao: null,
        acaoLabel: null,
      })
    }

    const tresAtras = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const abertas = ocorrencias.filter(o => o.status === 'aberta' && o.data <= tresAtras)
    if (abertas.length > 0) {
      lista.push({
        id: 'oc-abertas',
        tipo: 'urgente',
        icon: '⚡',
        titulo: `${abertas.length} ocorrência(s) aberta(s) há mais de 3 dias`,
        descricao: abertas.map(o => o.titulo).join(' · '),
        acao: 'ocorrencias',
        acaoLabel: 'Ver ocorrências',
      })
    }

    const alinhPendente = ocorrencias.filter(o =>
      o.status !== 'resolvida' && o.status !== 'arquivada' &&
      ((o.alinhamento_pais && !o.alinhamento_pais_data) ||
       (o.alinhamento_gestao?.length > 0 && !o.alinhamento_gestao_data))
    )
    if (alinhPendente.length > 0) {
      lista.push({
        id: 'alinhar',
        tipo: 'aviso',
        icon: '🤝',
        titulo: `${alinhPendente.length} ocorrência(s) com alinhamento pendente`,
        descricao: alinhPendente.map(o => `"${o.titulo}" — ${o.alinhamento_pais && !o.alinhamento_pais_data ? 'família' : ''}${o.alinhamento_gestao?.length > 0 && !o.alinhamento_gestao_data ? ' gestão' : ''}`).join(' · '),
        acao: 'ocorrencias',
        acaoLabel: 'Resolver',
      })
    }

    const seteDias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const emAcomp = ocorrencias.filter(o => o.status === 'acompanhamento' && o.data <= seteDias)
    if (emAcomp.length > 0) {
      lista.push({
        id: 'oc-acomp',
        tipo: 'aviso',
        icon: '🔄',
        titulo: `${emAcomp.length} ocorrência(s) em acompanhamento há +7 dias`,
        descricao: 'Verifique se já é possível encerrar.',
        acao: 'ocorrencias',
        acaoLabel: 'Ver',
      })
    }

    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay() + 1)
    const semanaStr = inicioSemana.toISOString().split('T')[0]
    const temPlano = planejamentos.some(p => p.semana === semanaStr)
    if (!temPlano && diaSemana === 1) {
      lista.push({
        id: 'plano',
        tipo: 'info',
        icon: '📅',
        titulo: 'Planejamento da semana não preenchido',
        descricao: 'É segunda-feira — o planejamento desta semana ainda não foi registrado.',
        acao: 'planejamento',
        acaoLabel: 'Planejar',
      })
    }

    const registroHoje = lsGet('integral_registro_' + hoje, null)
    if (!registroHoje && diaSemana !== 0 && diaSemana !== 6) {
      lista.push({
        id: 'registro',
        tipo: 'info',
        icon: '📋',
        titulo: 'Registro do dia não salvo',
        descricao: 'O Registro do Dia de hoje ainda não foi preenchido.',
        acao: 'registro-diario',
        acaoLabel: 'Registrar',
      })
    }

    return lista
  }, [children, registros, diaSemana])

  if (alertas.length === 0) return null

  const cores = {
    urgente: { bg: '#fce8e8', border: '#f09595', cor: '#791f1f' },
    aviso: { bg: '#faeeda', border: '#FAC775', cor: '#633806' },
    info: { bg: '#e6f1fb', border: '#b5d4f4', cor: '#0c447c' },
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, color: 'var(--ink)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        🔔 Alertas do dia
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: alertas.filter(a => a.tipo === 'urgente').length > 0 ? '#fce8e8' : '#faeeda', color: alertas.filter(a => a.tipo === 'urgente').length > 0 ? '#791f1f' : '#633806', fontWeight: 700 }}>
          {alertas.length}
        </span>
      </div>
      {alertas.map(a => {
        const c = cores[a.tipo]
        return (
          <div key={a.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 'var(--r2)', padding: '11px 14px', marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: c.cor, marginBottom: 2 }}>{a.titulo}</div>
              <div style={{ fontSize: 12, color: c.cor, opacity: 0.8, lineHeight: 1.4 }}>{a.descricao}</div>
            </div>
            {a.acao && (
              <button
                onClick={() => setPage(a.acao)}
                style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${c.border}`, background: '#fff', color: c.cor, fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
              >
                {a.acaoLabel} →
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
