import { useState, useMemo, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

const PESOS_PADRAO = {
  falta_crianca: 3,          // cada falta não justificada
  ocorrencia_crianca: {      // por gravidade
    baixa: 2, media: 5, alta: 10, critica: 15,
  },
  falta_educadora: 5,
  ocorrencia_educadora: {
    baixa: 3, media: 7, alta: 12, critica: 20,
  },
  rotina_nao_cumprida: 1,    // por item de rotina não marcado no dia (educadoras coletivamente)
}

function hexBar(pct) {
  if (pct >= 85) return '#4a7c59'
  if (pct >= 70) return '#b8923a'
  if (pct >= 50) return '#c4714a'
  return '#a32d2d'
}

export default function Notas() {
  const { children, educadoras } = useApp()
  const { user } = useAuth()

  // Gate — Apoio não vê esta tela
  const bloqueado = user?.grupo === 'Apoio'

  const [pesos, setPesos] = useState(() => lsGet('integral_pesos_avaliacao', PESOS_PADRAO))
  const [mostrarConfig, setMostrarConfig] = useState(false)
  const [habilitadoPorGrupo, setHabilitadoPorGrupo] = useState(() => lsGet('integral_notas_habilitado', { Apoio: false, 'Professor Referência': true, 'Administrador': true, 'Coordenadora': true, 'Diretora': true, 'RH': false }))
  const [periodo, setPeriodo] = useState(() => new Date().toISOString().slice(0, 7)) // AAAA-MM
  const [expandido, setExpandido] = useState(null)

  useEffect(() => { lsSet('integral_pesos_avaliacao', pesos) }, [pesos])
  useEffect(() => { lsSet('integral_notas_habilitado', habilitadoPorGrupo) }, [habilitadoPorGrupo])

  // Calcula notas a partir do estado existente
  const dadosCalculados = useMemo(() => {
    if (bloqueado) return null

    const chamada = lsGet('integral_chamada', {})
    const ocorrencias = lsGet('integral_ocorrencias', [])
    const ponto = lsGet('integral_ponto', {})

    const [ano, mes] = periodo.split('-').map(Number)
    const mesStr = periodo
    const emPeriodo = (iso) => iso && iso.startsWith(mesStr)

    // ── Crianças ──
    const notasCriancas = children.filter(c => !c.data_saida).map(c => {
      let nota = 100
      const eventos = []

      // faltas não justificadas (chamada === 'falta')
      let faltas = 0
      Object.entries(chamada).forEach(([d, registros]) => {
        if (!emPeriodo(d)) return
        if (registros[c.id] === 'falta') {
          faltas++
          eventos.push({ tipo: 'falta', data: d, peso: pesos.falta_crianca, descricao: 'Falta registrada' })
        }
      })
      nota -= faltas * pesos.falta_crianca

      // ocorrências em que a criança participou
      ocorrencias.forEach(oc => {
        if (!emPeriodo(oc.data)) return
        if (!oc.criancas_ids?.includes(c.id)) return
        const peso = pesos.ocorrencia_crianca[oc.gravidade] || 0
        nota -= peso
        eventos.push({ tipo: 'ocorrencia', data: oc.data, peso, descricao: `${oc.titulo} (${oc.gravidade})` })
      })

      return { id: c.id, nome: c.nome, cor: c.cor, nota: Math.max(0, nota), eventos }
    })

    // ── Educadoras ──
    const notasEducadoras = educadoras.map(e => {
      let nota = 100
      const eventos = []

      // Faltas no ponto
      const pontoEdu = ponto[e.id] || {}
      Object.entries(pontoEdu).forEach(([d, reg]) => {
        if (!emPeriodo(d)) return
        if (reg.status === 'F') {
          nota -= pesos.falta_educadora
          eventos.push({ tipo: 'falta', data: d, peso: pesos.falta_educadora, descricao: `Falta${reg.motivo ? ` — ${reg.motivo}` : ''}` })
        }
        // justificadas não penalizam
      })

      // Ocorrências em que participou
      ocorrencias.forEach(oc => {
        if (!emPeriodo(oc.data)) return
        if (!oc.educadoras_ids?.includes(e.id)) return
        const peso = pesos.ocorrencia_educadora[oc.gravidade] || 0
        nota -= peso
        eventos.push({ tipo: 'ocorrencia', data: oc.data, peso, descricao: `${oc.titulo} (${oc.gravidade})` })
      })

      return { id: e.id, nome: e.nome, tipo: e.tipo, cor: e.cor, nota: Math.max(0, nota), eventos }
    })

    return { notasCriancas, notasEducadoras }
  }, [children, educadoras, periodo, pesos, bloqueado])

  if (bloqueado) {
    return (
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title"><span className="title-icon">📊</span> Notas & Avaliação</div>
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--ink3)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 14 }}>Acesso restrito à coordenação e educadoras de referência.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">📊</span> Notas & Avaliação</div>
          <div className="page-subtitle">Avaliação automática — todos começam com 100% e perdem pontos por faltas e ocorrências</div>
        </div>
        <div className="header-actions">
          <input type="month" className="form-input" value={periodo} onChange={e => setPeriodo(e.target.value)} />
          <button className="btn btn-ghost btn-sm" onClick={() => setMostrarConfig(!mostrarConfig)}>⚙️ Configurar pesos</button>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        ℹ️ Esta avaliação é <strong>automática</strong> e baseada nos dados já registrados (chamada, ponto, ocorrências). Não é visível para o grupo Apoio.
      </div>

      {mostrarConfig && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">⚙️ Configuração dos pesos</div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Crianças</div>
          <div className="grid-2" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Peso por falta</label>
              <input type="number" className="form-input" value={pesos.falta_crianca} onChange={e => setPesos(p => ({ ...p, falta_crianca: Number(e.target.value) }))} />
            </div>
            {['baixa', 'media', 'alta', 'critica'].map(g => (
              <div key={g} className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ocorrência {g}</label>
                <input type="number" className="form-input" value={pesos.ocorrencia_crianca[g]} onChange={e => setPesos(p => ({ ...p, ocorrencia_crianca: { ...p.ocorrencia_crianca, [g]: Number(e.target.value) } }))} />
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Educadoras / Apoio</div>
          <div className="grid-2" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Peso por falta (não justificada)</label>
              <input type="number" className="form-input" value={pesos.falta_educadora} onChange={e => setPesos(p => ({ ...p, falta_educadora: Number(e.target.value) }))} />
            </div>
            {['baixa', 'media', 'alta', 'critica'].map(g => (
              <div key={g} className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ocorrência {g}</label>
                <input type="number" className="form-input" value={pesos.ocorrencia_educadora[g]} onChange={e => setPesos(p => ({ ...p, ocorrencia_educadora: { ...p.ocorrencia_educadora, [g]: Number(e.target.value) } }))} />
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Permissão de visualização por grupo</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.keys(habilitadoPorGrupo).map(g => (
              <label key={g} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, padding: '6px 12px', borderRadius: 8, background: 'var(--warm)', cursor: 'pointer' }}>
                <input type="checkbox" checked={habilitadoPorGrupo[g]} onChange={e => setHabilitadoPorGrupo(p => ({ ...p, [g]: e.target.checked }))} />
                {g}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Crianças */}
        <div>
          <div className="sec-title">🧒 Crianças ({dadosCalculados.notasCriancas.length})</div>
          {dadosCalculados.notasCriancas.sort((a, b) => a.nota - b.nota).map(item => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid var(--warm3)', borderRadius: 'var(--r2)', padding: '12px 14px', marginBottom: 8, cursor: item.eventos.length > 0 ? 'pointer' : 'default' }}
              onClick={() => item.eventos.length > 0 && setExpandido(expandido === 'c_' + item.id ? null : 'c_' + item.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: item.cor?.[0] || '#e8f0eb', color: item.cor?.[1] || '#2d5240' }}>{item.nome.substring(0, 1).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.nome}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--warm2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${item.nota}%`, height: '100%', background: hexBar(item.nota), transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: hexBar(item.nota), minWidth: 40, textAlign: 'right' }}>{item.nota}%</span>
                  </div>
                </div>
                {item.eventos.length > 0 && <span style={{ fontSize: 11, color: 'var(--ink4)' }}>{expandido === 'c_' + item.id ? '⌃' : '⌄'}</span>}
              </div>
              {expandido === 'c_' + item.id && item.eventos.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--warm3)' }}>
                  {item.eventos.map((ev, i) => (
                    <div key={i} style={{ fontSize: 11, color: 'var(--ink3)', padding: '3px 0', display: 'flex', gap: 8 }}>
                      <span style={{ minWidth: 70 }}>{ev.data.split('-').reverse().join('/')}</span>
                      <span style={{ flex: 1 }}>{ev.descricao}</span>
                      <span style={{ color: '#a32d2d', fontWeight: 600 }}>−{ev.peso}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Educadoras */}
        <div>
          <div className="sec-title">👩‍🏫 Educadoras ({dadosCalculados.notasEducadoras.length})</div>
          {dadosCalculados.notasEducadoras.sort((a, b) => a.nota - b.nota).map(item => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid var(--warm3)', borderRadius: 'var(--r2)', padding: '12px 14px', marginBottom: 8, cursor: item.eventos.length > 0 ? 'pointer' : 'default' }}
              onClick={() => item.eventos.length > 0 && setExpandido(expandido === 'e_' + item.id ? null : 'e_' + item.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: item.cor?.[0] || '#e8f0eb', color: item.cor?.[1] || '#2d5240' }}>{item.nome.substring(0, 1).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.nome} <span style={{ fontSize: 10, color: 'var(--ink4)', fontWeight: 400 }}>· {item.tipo}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--warm2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${item.nota}%`, height: '100%', background: hexBar(item.nota), transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: hexBar(item.nota), minWidth: 40, textAlign: 'right' }}>{item.nota}%</span>
                  </div>
                </div>
                {item.eventos.length > 0 && <span style={{ fontSize: 11, color: 'var(--ink4)' }}>{expandido === 'e_' + item.id ? '⌃' : '⌄'}</span>}
              </div>
              {expandido === 'e_' + item.id && item.eventos.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--warm3)' }}>
                  {item.eventos.map((ev, i) => (
                    <div key={i} style={{ fontSize: 11, color: 'var(--ink3)', padding: '3px 0', display: 'flex', gap: 8 }}>
                      <span style={{ minWidth: 70 }}>{ev.data.split('-').reverse().join('/')}</span>
                      <span style={{ flex: 1 }}>{ev.descricao}</span>
                      <span style={{ color: '#a32d2d', fontWeight: 600 }}>−{ev.peso}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
