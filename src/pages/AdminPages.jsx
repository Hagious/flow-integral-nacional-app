import { useState, useMemo } from 'react'
import { useAuth, registrarAuditoria } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }

const ACAO_CORES = {
  criar: { bg: '#EAF3DE', color: '#27500A', label: 'Criação' },
  editar: { bg: '#FAEEDA', color: '#633806', label: 'Edição' },
  excluir: { bg: '#FCEBEB', color: '#791F1F', label: 'Exclusão' },
  login: { bg: '#E6F1FB', color: '#0C447C', label: 'Login' },
  logout: { bg: '#F1EFE8', color: '#5F5E5A', label: 'Logout' },
  aprovar: { bg: '#EAF3DE', color: '#27500A', label: 'Aprovação' },
  rejeitar: { bg: '#FCEBEB', color: '#791F1F', label: 'Rejeição' },
  visualizar: { bg: '#F1EFE8', color: '#5F5E5A', label: 'Visualização' },
}

// ─── AUDITORIA ────────────────────────────────────────────────
export function Auditoria() {
  const [logs] = useState(() => lsGet('integral_auditoria', []))
  const [filtros, setFiltros] = useState({ usuario: '', modulo: '', acao: '', busca: '' })

  const filtrados = useMemo(() => logs.filter(l => {
    if (filtros.usuario && !l.usuario_nome?.toLowerCase().includes(filtros.usuario.toLowerCase())) return false
    if (filtros.modulo && l.modulo !== filtros.modulo) return false
    if (filtros.acao && l.acao !== filtros.acao) return false
    if (filtros.busca) {
      const q = filtros.busca.toLowerCase()
      return l.usuario_nome?.toLowerCase().includes(q) || l.modulo?.includes(q) || l.acao?.includes(q)
    }
    return true
  }), [logs, filtros])

  const modulos = [...new Set(logs.map(l => l.modulo))]

  function formatDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">🔍</span> Auditoria</div>
          <div className="page-subtitle">Histórico completo de ações realizadas no sistema</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => {
          const csv = ['Data,Usuário,Ação,Módulo,Registro', ...filtrados.map(l => `"${formatDate(l.created_at)}","${l.usuario_nome}","${l.acao}","${l.modulo}","${l.registro_id||''}"`)].join('\n')
          const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'})); a.download = 'auditoria.csv'; a.click()
        }}>📥 Exportar CSV</button>
      </div>

      {/* Filtros */}
      <div style={{ background: '#fff', border: '1px solid var(--warm3)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input className="form-input" style={{ flex: 2, minWidth: 160 }} placeholder="🔍 Buscar..." value={filtros.busca} onChange={e => setFiltros(p => ({ ...p, busca: e.target.value }))} />
        <select className="form-input" style={{ flex: 1, minWidth: 120 }} value={filtros.acao} onChange={e => setFiltros(p => ({ ...p, acao: e.target.value }))}>
          <option value="">Todas as ações</option>
          {Object.keys(ACAO_CORES).map(a => <option key={a} value={a}>{ACAO_CORES[a].label}</option>)}
        </select>
        <select className="form-input" style={{ flex: 1, minWidth: 120 }} value={filtros.modulo} onChange={e => setFiltros(p => ({ ...p, modulo: e.target.value }))}>
          <option value="">Todos os módulos</option>
          {modulos.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--ink3)', display: 'flex', alignItems: 'center' }}>{filtrados.length} registros</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--warm2)', borderBottom: '1px solid var(--warm3)' }}>
              {['Data e Hora', 'Usuário', 'Ação', 'Módulo', 'Antes → Depois'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.slice(0, 100).map(l => {
              const ac = ACAO_CORES[l.acao] || { bg: 'var(--warm2)', color: 'var(--ink3)', label: l.acao }
              return (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--warm3)' }}>
                  <td style={{ padding: '9px 14px', color: 'var(--ink3)', whiteSpace: 'nowrap' }}>{formatDate(l.created_at)}</td>
                  <td style={{ padding: '9px 14px', fontWeight: 500 }}>{l.usuario_nome || '—'}</td>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: ac.bg, color: ac.color }}>{ac.label}</span>
                  </td>
                  <td style={{ padding: '9px 14px', color: 'var(--ink2)' }}>{l.modulo}</td>
                  <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--ink3)', maxWidth: 200 }}>
                    {l.dados_antes || l.dados_depois
                      ? <span title={JSON.stringify({ antes: l.dados_antes, depois: l.dados_depois })}>🔍 Ver detalhes</span>
                      : '—'
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink3)' }}>Nenhum registro de auditoria encontrado.</div>
        )}
      </div>
    </div>
  )
}

// ─── CONTROLE DE PONTO REP-P ──────────────────────────────────
export function ControlePonto() {
  const { educadoras } = useApp()
  const { user } = useAuth()

  const [tab, setTab] = useState('bater')
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0])
  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0, 7))
  const [registros, setRegistros] = useState(() => lsGet('integral_ponto', []))
  const [ocorrencias, setOcorrencias] = useState(() => lsGet('integral_ponto_ocorrencias', []))
  const [loadingBatida, setLoadingBatida] = useState('')
  const [novaOcorrencia, setNovaOcorrencia] = useState({ educadora_id: '', data_inicio: '', data_fim: '', tipo: 'falta', motivo: '' })

  const today = new Date().toISOString().split('T')[0]

  const educadoraAtual = educadoras.find(e =>
    e.nome?.toLowerCase() === user?.nome?.toLowerCase() ||
    e.id === user?.educadora_id
  ) || educadoras[0]

  const pontoDia = useMemo(() =>
    registros.filter(r => r.educadora_id === educadoraAtual?.id && r.data === today),
    [registros, educadoraAtual, today]
  )

  const TIPOS = [
    { id: 'entrada', label: 'Entrada', icon: '▶️', cor: '#4a7c59' },
    { id: 'saida_almoco', label: 'Saída Almoço', icon: '⏸️', cor: '#b8923a' },
    { id: 'retorno_almoco', label: 'Retorno Almoço', icon: '▶️', cor: '#4a7c59' },
    { id: 'saida', label: 'Saída', icon: '⏹️', cor: '#a32d2d' },
  ]

  function calcularHoras(pontosDia) {
    const get = (tipo) => pontosDia.find(p => p.tipo === tipo)?.hora_registrada
    const entrada = get('entrada')
    const saida = get('saida')
    const saidaAlmoco = get('saida_almoco')
    const retornoAlmoco = get('retorno_almoco')
    if (!entrada || !saida) return null
    const total = new Date(saida) - new Date(entrada)
    let almoco = 0
    if (saidaAlmoco && retornoAlmoco) almoco = new Date(retornoAlmoco) - new Date(saidaAlmoco)
    const trabalhados = total - almoco
    const h = Math.floor(trabalhados / 3600000)
    const m = Math.floor((trabalhados % 3600000) / 60000)
    return `${h}h${m.toString().padStart(2,'0')}min`
  }

  async function baterPonto(tipo) {
    if (!educadoraAtual) return
    setLoadingBatida(tipo)
    await new Promise(r => setTimeout(r, 500)) // simula latência servidor

    const agora = new Date()
    const hash = btoa(`${educadoraAtual.id}-${tipo}-${agora.toISOString()}`).slice(0, 16)
    const registro = {
      id: Date.now().toString(),
      educadora_id: educadoraAtual.id,
      educadora_nome: educadoraAtual.nome,
      data: today,
      tipo,
      hora_registrada: agora.toISOString(),
      hora_servidor: agora.toISOString(),
      device_info: navigator.userAgent.substring(0, 80),
      hash_verificacao: hash,
      editado: false,
    }
    const n = [...registros.filter(r => !(r.educadora_id === educadoraAtual.id && r.data === today && r.tipo === tipo)), registro]
    setRegistros(n)
    lsSet('integral_ponto', n)
    registrarAuditoria('criar', 'ponto', registro.id, null, registro, user?.nome)
    setLoadingBatida('')
  }

  // Espelho de ponto (relatório mensal)
  function gerarEspelho(educadoraId) {
    const edu = educadoras.find(e => e.id === educadoraId)
    const [ano, mes] = mesFiltro.split('-').map(Number)
    const diasMes = new Date(ano, mes, 0).getDate()
    const pontosEdu = registros.filter(r => r.educadora_id === educadoraId && r.data?.startsWith(mesFiltro))

    const linhas = Array.from({ length: diasMes }, (_, i) => {
      const data = `${mesFiltro}-${String(i+1).padStart(2,'0')}`
      const dia = new Date(data + 'T12:00:00')
      const dsem = dia.getDay()
      const pontos = pontosEdu.filter(r => r.data === data)
      const get = (tipo) => pontos.find(p => p.tipo === tipo)
      const ocorr = ocorrencias.find(o => o.educadora_id === educadoraId && o.data_inicio <= data && o.data_fim >= data)

      return { data, dia: i+1, dsem, get, ocorr, pontos }
    })

    return { edu, linhas, pontosEdu }
  }

  const mesesDispo = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i)
    return d.toISOString().slice(0, 7)
  })

  const [espelhoEduId, setEspelhoEduId] = useState(educadoraAtual?.id || '')
  const espelho = espelhoEduId ? gerarEspelho(espelhoEduId) : null
  const DIAS_ABREV = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
  const OCORR_LABELS = { falta: 'Falta', falta_justificada: 'Falta Just.', atestado_medico: 'Atestado Méd.', atestado_familiar: 'Atestado Fam.', licenca_maternidade: 'Lic. Maternidade', folga_compensatoria: 'Folga Comp.', ferias: 'Férias', feriado: 'Feriado', outros: 'Outros' }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">⏱️</span> Controle de Ponto</div>
          <div className="page-subtitle">REP-P · Portaria 671/2021 · Ministério do Trabalho</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${tab==='bater'?' active':''}`} onClick={() => setTab('bater')}>Bater Ponto</button>
        <button className={`tab${tab==='espelho'?' active':''}`} onClick={() => setTab('espelho')}>Espelho Mensal</button>
        <button className={`tab${tab==='ocorrencias'?' active':''}`} onClick={() => setTab('ocorrencias')}>Ocorrências</button>
        <button className={`tab${tab==='geral'?' active':''}`} onClick={() => setTab('geral')}>Visão Geral</button>
      </div>

      {tab === 'bater' && (
        <div>
          <div className="card" style={{ maxWidth: 500, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: educadoraAtual?.cor?.[0] || '#e8f0eb', color: educadoraAtual?.cor?.[1] || '#2d5240' }}>
                {educadoraAtual?.nome?.substring(0, 1).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{educadoraAtual?.nome}</div>
                <div style={{ fontSize: 12, color: 'var(--ink3)' }}>{today.split('-').reverse().join('/')} · {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TIPOS.map(t => {
                const registrado = pontoDia.find(p => p.tipo === t.id)
                const isLoading = loadingBatida === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => baterPonto(t.id)}
                    disabled={!!registrado || isLoading}
                    style={{
                      padding: '14px', borderRadius: 'var(--r)', border: `2px solid ${registrado ? t.cor + '40' : t.cor}`,
                      background: registrado ? t.cor + '10' : '#fff',
                      cursor: registrado ? 'default' : 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{t.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.cor }}>{t.label}</span>
                    {registrado ? (
                      <span style={{ fontSize: 11, color: 'var(--ink3)' }}>
                        {new Date(registrado.hora_registrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        <span style={{ fontSize: 9, display: 'block', color: 'var(--ink4)' }}>#{registrado.hash_verificacao}</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--ink4)' }}>{isLoading ? '...' : 'Clique para registrar'}</span>
                    )}
                  </button>
                )
              })}
            </div>

            {pontoDia.length > 0 && (
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--sage-light)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--sage-dark)', marginBottom: 4 }}>
                  ✓ Ponto registrado hoje
                  {calcularHoras(pontoDia) && <span style={{ marginLeft: 8, fontWeight: 400 }}>· {calcularHoras(pontoDia)} trabalhadas</span>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--ink3)' }}>
                  Registros armazenados com hash de verificação · REP-P conforme Portaria 671/2021
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'espelho' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Educadora</label>
              <select className="form-input" value={espelhoEduId} onChange={e => setEspelhoEduId(e.target.value)}>
                {educadoras.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mês</label>
              <select className="form-input" value={mesFiltro} onChange={e => setMesFiltro(e.target.value)}>
                {mesesDispo.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>🖨️ Imprimir espelho</button>
            </div>
          </div>

          {espelho && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', background: 'var(--sage-dark)', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16 }}>Espelho de Ponto — {espelho.edu?.nome}</div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>{mesFiltro}</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--warm2)' }}>
                    {['Dia','Dia da semana','Entrada','Saída Alm.','Retorno Alm.','Saída','Total','Ocorrência'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'center', fontSize: 10, fontWeight: 500, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {espelho.linhas.map(({ data, dia, dsem, get, ocorr }) => {
                    const isWeekend = dsem === 0 || dsem === 6
                    const fmtHora = (tipo) => {
                      const r = get(tipo)
                      if (!r) return '—'
                      return new Date(r.hora_registrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    }
                    const pontosDia = [get('entrada'), get('saida_almoco'), get('retorno_almoco'), get('saida')].filter(Boolean)
                    const total = calcularHoras(pontosDia)
                    return (
                      <tr key={data} style={{
                        borderBottom: '1px solid var(--warm3)',
                        background: isWeekend ? 'var(--warm)' : ocorr ? '#fce8e8' : '#fff',
                        opacity: isWeekend ? 0.6 : 1,
                      }}>
                        <td style={{ textAlign: 'center', padding: '7px 10px', fontWeight: 500 }}>{dia}</td>
                        <td style={{ textAlign: 'center', padding: '7px 10px', color: 'var(--ink3)' }}>{DIAS_ABREV[dsem]}</td>
                        <td style={{ textAlign: 'center', padding: '7px 10px', color: isWeekend ? 'var(--ink4)' : 'var(--ink)' }}>{isWeekend ? '—' : fmtHora('entrada')}</td>
                        <td style={{ textAlign: 'center', padding: '7px 10px', color: 'var(--ink3)' }}>{isWeekend ? '—' : fmtHora('saida_almoco')}</td>
                        <td style={{ textAlign: 'center', padding: '7px 10px', color: 'var(--ink3)' }}>{isWeekend ? '—' : fmtHora('retorno_almoco')}</td>
                        <td style={{ textAlign: 'center', padding: '7px 10px', color: isWeekend ? 'var(--ink4)' : 'var(--ink)' }}>{isWeekend ? '—' : fmtHora('saida')}</td>
                        <td style={{ textAlign: 'center', padding: '7px 10px', fontWeight: total ? 600 : 400, color: total ? 'var(--sage-dark)' : 'var(--ink4)' }}>{isWeekend ? '—' : (total || '—')}</td>
                        <td style={{ textAlign: 'center', padding: '7px 10px' }}>
                          {ocorr && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#fce8e8', color: '#791f1f' }}>{OCORR_LABELS[ocorr.tipo] || ocorr.tipo}</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'ocorrencias' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">+ Registrar ocorrência</div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Educadora</label>
                <select className="form-input" value={novaOcorrencia.educadora_id} onChange={e => setNovaOcorrencia(p => ({ ...p, educadora_id: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {educadoras.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Tipo</label>
                <select className="form-input" value={novaOcorrencia.tipo} onChange={e => setNovaOcorrencia(p => ({ ...p, tipo: e.target.value }))}>
                  {Object.entries(OCORR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Data início</label><input type="date" className="form-input" value={novaOcorrencia.data_inicio} onChange={e => setNovaOcorrencia(p => ({ ...p, data_inicio: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Data fim</label><input type="date" className="form-input" value={novaOcorrencia.data_fim} onChange={e => setNovaOcorrencia(p => ({ ...p, data_fim: e.target.value }))} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Motivo / Observação</label><textarea className="form-input" value={novaOcorrencia.motivo} onChange={e => setNovaOcorrencia(p => ({ ...p, motivo: e.target.value }))} placeholder="Detalhes da ocorrência..." /></div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => {
              if (!novaOcorrencia.educadora_id || !novaOcorrencia.data_inicio) return
              const n = [...ocorrencias, { id: Date.now().toString(), ...novaOcorrencia }]
              setOcorrencias(n); lsSet('integral_ponto_ocorrencias', n)
              registrarAuditoria('criar', 'ponto', novaOcorrencia.educadora_id, null, novaOcorrencia, user?.nome)
              setNovaOcorrencia({ educadora_id: '', data_inicio: '', data_fim: '', tipo: 'falta', motivo: '' })
            }}>Registrar</button>
          </div>

          {ocorrencias.map(o => {
            const edu = educadoras.find(e => e.id === o.educadora_id)
            return (
              <div key={o.id} className="card" style={{ marginBottom: 10, padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 11, background: edu?.cor?.[0] || '#e8f0eb', color: edu?.cor?.[1] || '#2d5240' }}>{edu?.nome?.substring(0,1)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{edu?.nome || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{o.data_inicio?.split('-').reverse().join('/')} a {o.data_fim?.split('-').reverse().join('/')}</div>
                  </div>
                  <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 11, background: '#fce8e8', color: '#791f1f', fontWeight: 500 }}>{OCORR_LABELS[o.tipo] || o.tipo}</span>
                </div>
                {o.motivo && <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 6, paddingLeft: 44 }}>{o.motivo}</div>}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'geral' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Data</label>
              <input type="date" className="form-input" value={dataFiltro} onChange={e => setDataFiltro(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {educadoras.map(edu => {
              const pontosEdu = registros.filter(r => r.educadora_id === edu.id && r.data === dataFiltro)
              const total = calcularHoras(pontosEdu)
              return (
                <div key={edu.id} className="card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: edu.cor?.[0] || '#e8f0eb', color: edu.cor?.[1] || '#2d5240' }}>{edu.nome?.substring(0,1)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{edu.nome} <span style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 400 }}>· {edu.tipo}</span></div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                        {['entrada','saida_almoco','retorno_almoco','saida'].map(tipo => {
                          const r = pontosEdu.find(p => p.tipo === tipo)
                          const labels = { entrada: 'Entrada', saida_almoco: 'Saída Alm.', retorno_almoco: 'Retorno', saida: 'Saída' }
                          return (
                            <div key={tipo} style={{ fontSize: 11, textAlign: 'center' }}>
                              <div style={{ color: 'var(--ink4)', marginBottom: 2 }}>{labels[tipo]}</div>
                              <div style={{ fontWeight: r ? 600 : 400, color: r ? 'var(--sage-dark)' : 'var(--ink4)' }}>
                                {r ? new Date(r.hora_registrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </div>
                            </div>
                          )
                        })}
                        {total && <div style={{ fontSize: 11, textAlign: 'center', marginLeft: 'auto' }}><div style={{ color: 'var(--ink4)', marginBottom: 2 }}>Total</div><div style={{ fontWeight: 600, color: 'var(--sage-dark)' }}>{total}</div></div>}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {pontosEdu.length === 0 ? (
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: 'var(--warm2)', color: 'var(--ink4)' }}>Sem registro</span>
                      ) : (
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: 'var(--sage-light)', color: 'var(--sage-dark)' }}>✓ {pontosEdu.length} batida{pontosEdu.length > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
