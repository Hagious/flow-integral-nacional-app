import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const EIXOS = [
  { icon: '🤝', label: 'Social (interação, conflitos, cooperação)' },
  { icon: '🚶', label: 'Autonomia (cuidados pessoais, responsabilidades)' },
  { icon: '🧠', label: 'Cognitivo (curiosidade, participação, investigação)' },
  { icon: '🌿', label: 'Relação com o ambiente (horta, animais, materiais)' },
  { icon: '📝', label: 'Observação geral' },
]

const DIAS_SEMANA = [
  { id: 1, label: 'Seg', full: 'Segunda' },
  { id: 2, label: 'Ter', full: 'Terça' },
  { id: 3, label: 'Qua', full: 'Quarta' },
  { id: 4, label: 'Qui', full: 'Quinta' },
  { id: 5, label: 'Sex', full: 'Sexta' },
]

const MOTIVOS_SAIDA = [
  'Mudança de cidade',
  'Mudança de escola',
  'Fim do contrato',
  'Questões familiares',
  'Questões financeiras',
  'Inadaptação',
  'Outro',
]

const PARENTESCOS = ['Mãe', 'Pai', 'Avó', 'Avô', 'Tia', 'Tio', 'Responsável legal', 'Outro']

const CONDICOES_INCLUSAO = [
  'TDAH', 'TEA', 'TOD', 'Dislexia', 'TDI (deficiência intelectual)',
  'Deficiência física', 'Deficiência visual', 'Deficiência auditiva',
  'Altas habilidades / Superdotação', 'Atraso de desenvolvimento',
  'Transtorno de ansiedade', 'Outro',
]

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

function getDataNasc(child) { return child.data_nascimento || child.nasc || '' }
function getIdade(child) {
  const nasc = getDataNasc(child)
  if (!nasc) return null
  const diff = Date.now() - new Date(nasc).getTime()
  const y = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
  return y
}
function fmtData(d) { return d ? d.split('-').reverse().join('/') : '' }

// ─── Card individual ──────────────────────────────────────────
function ChildCard({ child, onUpdate, onAddObs, podeVerResponsaveis }) {
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [obsForm, setObsForm] = useState({ data: new Date().toISOString().split('T')[0], ...Object.fromEntries(EIXOS.map((_, i) => [i, ''])) })

  const [editData, setEditData] = useState(() => ({
    nome: child.nome || '',
    data_nascimento: getDataNasc(child),
    data_entrada_escola: child.data_entrada_escola || '',
    data_inicio_integral: child.data_inicio_integral || '',
    data_saida: child.data_saida || '',
    motivo_saida: child.motivo_saida || '',
    obs_saida: child.obs_saida || '',
    responsaveis: child.responsaveis || [],
    autorizados_retirada: child.autorizados_retirada || '',
    frequencia_atual: child.frequencia_atual || { dias: [1, 2, 3, 4, 5], inicio: '', motivo: '' },
    frequencia_historico: child.frequencia_historico || [],
    inclusao: child.inclusao || { tem: false, condicoes: [], outro: '', cid: '', laudo: false, acompanhamento_externo: '', estrategias: '', observacoes: '' },
  }))

  const [novaFreq, setNovaFreq] = useState(null)

  const idade = getIdade(child)
  const idadeTxt = idade === null ? 'Idade não informada' : (idade === 0 ? 'Menos de 1 ano' : `${idade} ano${idade > 1 ? 's' : ''}`)
  const ativo = !child.data_saida

  function toggleDia(id) {
    setEditData(p => ({
      ...p,
      frequencia_atual: {
        ...p.frequencia_atual,
        dias: p.frequencia_atual.dias.includes(id)
          ? p.frequencia_atual.dias.filter(d => d !== id)
          : [...p.frequencia_atual.dias, id].sort()
      }
    }))
  }

  function addResponsavel() {
    setEditData(p => ({ ...p, responsaveis: [...p.responsaveis, { id: Date.now().toString(), parentesco: 'Mãe', nome: '', tel: '', email: '', permite_contato: false }] }))
  }
  function updResp(idx, patch) {
    setEditData(p => ({ ...p, responsaveis: p.responsaveis.map((r, i) => i === idx ? { ...r, ...patch } : r) }))
  }
  function rmResp(idx) {
    setEditData(p => ({ ...p, responsaveis: p.responsaveis.filter((_, i) => i !== idx) }))
  }

  function salvar() {
    let freqPatch = {}
    if (novaFreq && novaFreq.dias.length > 0 && novaFreq.inicio) {
      const atual = editData.frequencia_atual
      const historico = [
        ...(editData.frequencia_historico || []),
        { ...atual, fim: novaFreq.inicio }
      ]
      freqPatch = {
        frequencia_atual: { dias: novaFreq.dias, inicio: novaFreq.inicio, motivo: novaFreq.motivo },
        frequencia_historico: historico,
      }
    }
    onUpdate(child.id, { ...editData, ...freqPatch })
    setNovaFreq(null)
    setEditMode(false)
  }

  return (
    <div className="child-card" style={{ opacity: ativo ? 1 : 0.75 }}>
      <div className="child-header" onClick={() => setOpen(!open)}>
        <div className="avatar" style={{ width: 38, height: 38, fontSize: 15, background: child.cor?.[0] || '#e8f0eb', color: child.cor?.[1] || '#2d5240' }}>
          {child.nome.substring(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            {child.nome}
            {!ativo && <span style={{ fontSize: 10, padding: '2px 8px', background: '#f1efe8', color: '#5f5e5a', borderRadius: 10, fontWeight: 600 }}>SAIU</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
            {idadeTxt} · {fmtData(getDataNasc(child)) || 'Nasc. não informado'} · {child.obs?.length || 0} observações
          </div>
        </div>
        <span style={{ fontSize: 18, color: 'var(--ink4)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
      </div>

      {open && (
        <div className="child-body">
          {!editMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-ghost btn-xs" onClick={() => setEditMode(true)}>✏️ Editar ficha</button>
            </div>
          )}

          {editMode ? (
            <div style={{ marginBottom: 16 }}>
              {/* Dados básicos */}
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Dados básicos</div>
              <div className="grid-2" style={{ marginBottom: 14 }}>
                <div className="form-group"><label className="form-label">Nome *</label><input className="form-input" value={editData.nome} onChange={e => setEditData(p => ({ ...p, nome: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Data de nascimento</label><input type="date" className="form-input" value={editData.data_nascimento} onChange={e => setEditData(p => ({ ...p, data_nascimento: e.target.value }))} /></div>
                <div className="form-group">
                  <label className="form-label">Entrada na escola Nacional</label>
                  <input type="date" className="form-input" value={editData.data_entrada_escola} onChange={e => setEditData(p => ({ ...p, data_entrada_escola: e.target.value }))} />
                  <div style={{ fontSize: 10, color: 'var(--ink4)', marginTop: 2 }}>Quando iniciou na escola (qualquer ano)</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Início no Integral (ano corrente)</label>
                  <input type="date" className="form-input" value={editData.data_inicio_integral} onChange={e => setEditData(p => ({ ...p, data_inicio_integral: e.target.value }))} />
                  <div style={{ fontSize: 10, color: 'var(--ink4)', marginTop: 2 }}>Início no Integral neste ano letivo</div>
                </div>
              </div>

              {/* Inclusão */}
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>🧠 Inclusão / Necessidades especiais</div>
              <div style={{ background: 'var(--warm)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 500, color: 'var(--ink2)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editData.inclusao.tem} onChange={e => setEditData(p => ({ ...p, inclusao: { ...p.inclusao, tem: e.target.checked } }))} />
                  Criança com necessidade de acompanhamento especial
                </label>
                {editData.inclusao.tem && (
                  <div style={{ marginTop: 12, paddingLeft: 22 }}>
                    <label className="form-label">Condições / diagnósticos</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      {CONDICOES_INCLUSAO.map(c => {
                        const sel = editData.inclusao.condicoes.includes(c)
                        return (
                          <button key={c} type="button" onClick={() => setEditData(p => ({
                            ...p,
                            inclusao: {
                              ...p.inclusao,
                              condicoes: sel ? p.inclusao.condicoes.filter(x => x !== c) : [...p.inclusao.condicoes, c]
                            }
                          }))}
                            style={{ padding: '5px 12px', borderRadius: 14, fontSize: 11, cursor: 'pointer', border: `1.5px solid ${sel ? '#6b4e71' : 'var(--warm3)'}`, background: sel ? '#ede5f0' : '#fff', color: sel ? '#3d2a42' : 'var(--ink3)', fontWeight: sel ? 600 : 400 }}>
                            {sel ? '✓ ' : ''}{c}
                          </button>
                        )
                      })}
                    </div>
                    {editData.inclusao.condicoes.includes('Outro') && (
                      <div className="form-group"><label className="form-label">Qual?</label><input className="form-input" value={editData.inclusao.outro} onChange={e => setEditData(p => ({ ...p, inclusao: { ...p.inclusao, outro: e.target.value } }))} /></div>
                    )}
                    <div className="grid-2" style={{ gap: 10 }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">CID (se informado)</label>
                        <input className="form-input" value={editData.inclusao.cid} onChange={e => setEditData(p => ({ ...p, inclusao: { ...p.inclusao, cid: e.target.value } }))} placeholder="Ex: F84.0" />
                      </div>
                      <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--ink2)' }}>
                          <input type="checkbox" checked={editData.inclusao.laudo} onChange={e => setEditData(p => ({ ...p, inclusao: { ...p.inclusao, laudo: e.target.checked } }))} />
                          Possui laudo médico
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Acompanhamento externo</label>
                      <input className="form-input" value={editData.inclusao.acompanhamento_externo} onChange={e => setEditData(p => ({ ...p, inclusao: { ...p.inclusao, acompanhamento_externo: e.target.value } }))} placeholder="Ex: Psicólogo semanal, fonoaudiólogo..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estratégias pedagógicas adotadas</label>
                      <textarea className="form-input" style={{ minHeight: 60 }} value={editData.inclusao.estrategias} onChange={e => setEditData(p => ({ ...p, inclusao: { ...p.inclusao, estrategias: e.target.value } }))} placeholder="O que funciona para esta criança no dia a dia" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Observações gerais</label>
                      <textarea className="form-input" style={{ minHeight: 50 }} value={editData.inclusao.observacoes} onChange={e => setEditData(p => ({ ...p, inclusao: { ...p.inclusao, observacoes: e.target.value } }))} />
                    </div>
                  </div>
                )}
              </div>

              {/* Responsáveis */}
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>👨‍👩‍👧 Responsáveis</div>
              {podeVerResponsaveis ? (
                <div style={{ marginBottom: 14 }}>
                  {editData.responsaveis.map((r, i) => (
                    <div key={r.id || i} style={{ background: 'var(--warm)', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                      <div className="grid-2" style={{ gap: 8 }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Parentesco</label>
                          <select className="form-input" value={r.parentesco} onChange={e => updResp(i, { parentesco: e.target.value })}>
                            {PARENTESCOS.map(p => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Nome</label>
                          <input className="form-input" value={r.nome} onChange={e => updResp(i, { nome: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Telefone</label>
                          <input className="form-input" value={r.tel} onChange={e => updResp(i, { tel: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">E-mail</label>
                          <input className="form-input" value={r.email} onChange={e => updResp(i, { email: e.target.value })} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: 'var(--ink3)' }}>
                          <input type="checkbox" checked={!!r.permite_contato} onChange={e => updResp(i, { permite_contato: e.target.checked })} />
                          Autorizar envio de comunicações pela ferramenta (futuro)
                        </label>
                        <button className="btn btn-ghost btn-xs" onClick={() => rmResp(i)}>Remover</button>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={addResponsavel}>+ Adicionar responsável</button>
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="form-label">Autorizados a retirar a criança</label>
                    <textarea className="form-input" style={{ minHeight: 50 }} value={editData.autorizados_retirada} onChange={e => setEditData(p => ({ ...p, autorizados_retirada: e.target.value }))} placeholder="Nome completo, parentesco e documento dos autorizados" />
                  </div>
                </div>
              ) : (
                <div style={{ background: '#faeeda', border: '1px solid #FAC775', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#633806' }}>
                  🔒 Acesso aos dados dos responsáveis restrito. Fale com a coordenação.
                </div>
              )}

              {/* Dias contratados */}
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>📅 Dias contratados</div>
              <div style={{ background: 'var(--warm)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 8 }}>Selecione os dias em que a criança frequenta o integral</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {DIAS_SEMANA.map(d => {
                    const sel = editData.frequencia_atual.dias.includes(d.id)
                    return (
                      <button key={d.id} onClick={() => toggleDia(d.id)}
                        style={{ padding: '6px 14px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${sel ? '#4a7c59' : 'var(--warm3)'}`, background: sel ? '#e8f0eb' : '#fff', color: sel ? '#2d5240' : 'var(--ink3)', fontWeight: sel ? 600 : 400 }}>
                        {sel ? '✓ ' : ''}{d.full}
                      </button>
                    )
                  })}
                </div>

                {!novaFreq && (
                  <button className="btn btn-ghost btn-xs" onClick={() => setNovaFreq({ dias: editData.frequencia_atual.dias, inicio: new Date().toISOString().split('T')[0], motivo: '' })}>
                    + Registrar alteração de dias (histórico)
                  </button>
                )}

                {novaFreq && (
                  <div style={{ background: '#fff', borderRadius: 8, padding: 12, marginTop: 10, border: '1px dashed var(--warm3)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginBottom: 8 }}>Nova configuração de dias</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      {DIAS_SEMANA.map(d => {
                        const sel = novaFreq.dias.includes(d.id)
                        return (
                          <button key={d.id}
                            onClick={() => setNovaFreq(p => ({ ...p, dias: p.dias.includes(d.id) ? p.dias.filter(x => x !== d.id) : [...p.dias, d.id].sort() }))}
                            style={{ padding: '5px 12px', borderRadius: 14, fontSize: 11, cursor: 'pointer', border: `1.5px solid ${sel ? '#c4714a' : 'var(--warm3)'}`, background: sel ? '#f5ece6' : '#fff', color: sel ? '#8b3e21' : 'var(--ink3)' }}>
                            {sel ? '✓ ' : ''}{d.full}
                          </button>
                        )
                      })}
                    </div>
                    <div className="grid-2" style={{ gap: 8 }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">A partir de</label>
                        <input type="date" className="form-input" value={novaFreq.inicio} onChange={e => setNovaFreq(p => ({ ...p, inicio: e.target.value }))} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Motivo</label>
                        <input className="form-input" value={novaFreq.motivo} onChange={e => setNovaFreq(p => ({ ...p, motivo: e.target.value }))} placeholder="Ex: solicitação dos pais" />
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-xs" onClick={() => setNovaFreq(null)} style={{ marginTop: 6 }}>Cancelar alteração</button>
                  </div>
                )}

                {editData.frequencia_historico?.length > 0 && (
                  <div style={{ marginTop: 12, fontSize: 11 }}>
                    <div style={{ color: 'var(--ink3)', fontWeight: 600, marginBottom: 6 }}>Histórico</div>
                    {editData.frequencia_historico.map((h, i) => (
                      <div key={i} style={{ color: 'var(--ink3)', marginBottom: 4 }}>
                        • {h.dias.map(id => DIAS_SEMANA.find(d => d.id === id)?.label).join(', ')} — {fmtData(h.inicio)} a {fmtData(h.fim)}{h.motivo && ` · ${h.motivo}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Saída */}
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>🚪 Encerramento</div>
              <div className="grid-2" style={{ marginBottom: 14 }}>
                <div className="form-group"><label className="form-label">Data de saída</label><input type="date" className="form-input" value={editData.data_saida} onChange={e => setEditData(p => ({ ...p, data_saida: e.target.value }))} /></div>
                <div className="form-group">
                  <label className="form-label">Motivo</label>
                  <select className="form-input" value={editData.motivo_saida} onChange={e => setEditData(p => ({ ...p, motivo_saida: e.target.value }))}>
                    <option value="">—</option>
                    {MOTIVOS_SAIDA.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Observações do encerramento</label>
                  <textarea className="form-input" style={{ minHeight: 50 }} value={editData.obs_saida} onChange={e => setEditData(p => ({ ...p, obs_saida: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={salvar}>💾 Salvar ficha</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--ink2)' }}>
              {child.data_entrada_escola && <div>🏫 Na escola Nacional desde {fmtData(child.data_entrada_escola)}</div>}
              {child.data_inicio_integral && <div>📅 No Integral (ano corrente) desde {fmtData(child.data_inicio_integral)}</div>}
              {child.frequencia_atual?.dias?.length > 0 && (
                <div>📋 Dias contratados: {child.frequencia_atual.dias.map(id => DIAS_SEMANA.find(d => d.id === id)?.full).join(', ')}</div>
              )}
              {child.inclusao?.tem && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#ede5f0', border: '1px solid #d5c2da', borderRadius: 8 }}>
                  🧠 <strong>Inclusão:</strong> {[...(child.inclusao.condicoes || []), child.inclusao.outro].filter(Boolean).join(', ') || 'Acompanhamento especial'}
                  {child.inclusao.laudo && <span style={{ marginLeft: 6, fontSize: 11, padding: '2px 6px', background: '#fff', borderRadius: 6 }}>com laudo</span>}
                  {child.inclusao.acompanhamento_externo && <div style={{ fontSize: 12, marginTop: 4 }}>Acompanhamento: {child.inclusao.acompanhamento_externo}</div>}
                  {child.inclusao.estrategias && <div style={{ fontSize: 12, marginTop: 4 }}><em>Estratégias:</em> {child.inclusao.estrategias}</div>}
                </div>
              )}
              {!ativo && (
                <div style={{ marginTop: 6, padding: '8px 12px', background: '#f1efe8', borderRadius: 8 }}>
                  🚪 Saiu em {fmtData(child.data_saida)}{child.motivo_saida && ` — ${child.motivo_saida}`}
                  {child.obs_saida && <div style={{ fontSize: 12, marginTop: 4 }}>{child.obs_saida}</div>}
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink2)', marginBottom: 10 }}>Nova observação</div>
          <div style={{ background: 'var(--warm)', borderRadius: 'var(--r)', padding: 14, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Data</label>
              <input type="date" className="form-input" value={obsForm.data} onChange={e => setObsForm(p => ({ ...p, data: e.target.value }))} />
            </div>
            {EIXOS.map((eixo, i) => (
              <div key={i} className="obs-eixo">
                <div className="obs-eixo-title">{eixo.icon} {eixo.label}</div>
                <textarea className="form-input" style={{ minHeight: 60, background: 'var(--white)' }} placeholder="Registre..."
                  value={obsForm[i]} onChange={e => setObsForm(p => ({ ...p, [i]: e.target.value }))} />
              </div>
            ))}
            <button className="btn btn-primary btn-sm" onClick={() => {
              const hasContent = EIXOS.some((_, i) => obsForm[i])
              if (!hasContent) return
              onAddObs(child.id, { data: obsForm.data, eixos: EIXOS.map((e, i) => ({ label: e.label, icon: e.icon, texto: obsForm[i] })).filter(e => e.texto) })
              setObsForm({ data: new Date().toISOString().split('T')[0], ...Object.fromEntries(EIXOS.map((_, i) => [i, ''])) })
            }}>+ Salvar observação</button>
          </div>

          {child.obs?.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Histórico de observações</div>
              {child.obs.map(o => (
                <div key={o.id} style={{ background: 'var(--warm)', borderRadius: 'var(--r2)', padding: '12px 14px', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 6, fontWeight: 500 }}>📅 {fmtData(o.data)}</div>
                  {o.eixos?.map((e, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink2)' }}>{e.icon} {e.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2 }}>{e.texto}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Chamada Diária ───────────────────────────────────────────
function ChamadaDiaria({ criancas }) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [chamada, setChamada] = useState(() => lsGet('integral_chamada', {}))

  const diaSemana = new Date(data + 'T12:00').getDay()
  const chamadaDia = chamada[data] || {}

  const ativos = criancas.filter(c => !c.data_saida)
  const esperadas = ativos.filter(c => (c.frequencia_atual?.dias || [1, 2, 3, 4, 5]).includes(diaSemana))
  const naoEsperadas = ativos.filter(c => !(c.frequencia_atual?.dias || [1, 2, 3, 4, 5]).includes(diaSemana))

  function marcar(id, valor) {
    const next = { ...chamada, [data]: { ...chamadaDia, [id]: chamadaDia[id] === valor ? null : valor } }
    if (next[data][id] === null) delete next[data][id]
    setChamada(next)
    lsSet('integral_chamada', next)
  }

  const presentes = Object.values(chamadaDia).filter(v => v === 'presente').length
  const faltas = Object.values(chamadaDia).filter(v => v === 'falta').length
  const extras = naoEsperadas.filter(c => chamadaDia[c.id] === 'presente')
  const semMarcacao = esperadas.filter(c => !chamadaDia[c.id])

  return (
    <div>
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Data da chamada</label>
          <input type="date" className="form-input" value={data} onChange={e => setData(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 14, marginLeft: 'auto' }}>
          <div><div style={{ fontSize: 20, fontWeight: 600, color: '#27500a' }}>{presentes}</div><div style={{ fontSize: 11, color: 'var(--ink3)' }}>Presentes</div></div>
          <div><div style={{ fontSize: 20, fontWeight: 600, color: '#a32d2d' }}>{faltas}</div><div style={{ fontSize: 11, color: 'var(--ink3)' }}>Faltas</div></div>
          <div><div style={{ fontSize: 20, fontWeight: 600, color: '#854f0b' }}>{extras.length}</div><div style={{ fontSize: 11, color: 'var(--ink3)' }}>Extras</div></div>
        </div>
      </div>

      {semMarcacao.length > 0 && (
        <div style={{ background: '#faeeda', border: '1px solid #FAC775', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#633806' }}>
          ⚠️ {semMarcacao.length} criança(s) esperada(s) ainda não foram marcadas
        </div>
      )}

      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
        Esperadas hoje ({esperadas.length})
      </div>
      {esperadas.map(c => {
        const status = chamadaDia[c.id]
        return (
          <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#fff', border: '1px solid var(--warm3)', borderRadius: 8, padding: '10px 14px', marginBottom: 6 }}>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: c.cor?.[0] || '#e8f0eb', color: c.cor?.[1] || '#2d5240' }}>{c.nome.substring(0, 1).toUpperCase()}</div>
            <div style={{ flex: 1, fontSize: 13 }}>{c.nome}</div>
            <button onClick={() => marcar(c.id, 'presente')}
              style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${status === 'presente' ? '#27500a' : 'var(--warm3)'}`, background: status === 'presente' ? '#eaf3de' : '#fff', color: status === 'presente' ? '#27500a' : 'var(--ink3)', fontWeight: status === 'presente' ? 600 : 400 }}>
              ✓ Presente
            </button>
            <button onClick={() => marcar(c.id, 'falta')}
              style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${status === 'falta' ? '#a32d2d' : 'var(--warm3)'}`, background: status === 'falta' ? '#fce8e8' : '#fff', color: status === 'falta' ? '#a32d2d' : 'var(--ink3)', fontWeight: status === 'falta' ? 600 : 400 }}>
              ✕ Falta
            </button>
          </div>
        )
      })}

      {naoEsperadas.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 18, marginBottom: 10 }}>
            Não programadas para hoje
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink4)', marginBottom: 8 }}>Marque apenas se a criança apareceu em dia fora do contrato</div>
          {naoEsperadas.map(c => {
            const status = chamadaDia[c.id]
            const extra = status === 'presente'
            return (
              <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: extra ? '#faeeda' : '#fff', border: `1px solid ${extra ? '#FAC775' : 'var(--warm3)'}`, borderRadius: 8, padding: '10px 14px', marginBottom: 6 }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: c.cor?.[0] || '#e8f0eb', color: c.cor?.[1] || '#2d5240' }}>{c.nome.substring(0, 1).toUpperCase()}</div>
                <div style={{ flex: 1, fontSize: 13 }}>
                  {c.nome}
                  {extra && <span style={{ fontSize: 10, marginLeft: 8, padding: '2px 6px', background: '#FAC775', color: '#633806', borderRadius: 8, fontWeight: 600 }}>⚠️ DIA EXTRA</span>}
                </div>
                <button onClick={() => marcar(c.id, 'presente')}
                  style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${extra ? '#854f0b' : 'var(--warm3)'}`, background: extra ? '#FAC775' : '#fff', color: extra ? '#633806' : 'var(--ink3)' }}>
                  Marcar presença extra
                </button>
              </div>
            )
          })}
        </>
      )}

      {esperadas.length === 0 && naoEsperadas.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink4)' }}>Nenhuma criança ativa cadastrada.</div>
      )}
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────
export default function Criancas() {
  const { children, addChild, updateChild, addChildObs } = useApp()
  const { user } = useAuth()
  const podeVerResponsaveis = user?.grupo !== 'Apoio'

  const [tab, setTab] = useState('fichas')
  const [filtro, setFiltro] = useState('ativos')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', data_nascimento: '', data_entrada_escola: '', data_inicio_integral: '', dias: [1, 2, 3, 4, 5] })

  const filtradas = useMemo(() => {
    if (filtro === 'ativos') return children.filter(c => !c.data_saida)
    if (filtro === 'saidos') return children.filter(c => !!c.data_saida)
    return children
  }, [children, filtro])

  function toggleDiaForm(id) {
    setForm(p => ({ ...p, dias: p.dias.includes(id) ? p.dias.filter(d => d !== id) : [...p.dias, id].sort() }))
  }

  function criar() {
    if (!form.nome) return
    addChild({
      nome: form.nome,
      data_nascimento: form.data_nascimento,
      data_entrada_escola: form.data_entrada_escola,
      data_inicio_integral: form.data_inicio_integral,
      frequencia_atual: { dias: form.dias, inicio: form.data_inicio_integral || new Date().toISOString().split('T')[0], motivo: 'Cadastro inicial' },
      frequencia_historico: [],
      responsaveis: [],
      inclusao: { tem: false, condicoes: [], outro: '', cid: '', laudo: false, acompanhamento_externo: '', estrategias: '', observacoes: '' },
    })
    setForm({ nome: '', data_nascimento: '', data_entrada_escola: '', data_inicio_integral: '', dias: [1, 2, 3, 4, 5] })
    setShowForm(false)
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">🧒</span> Crianças</div>
          <div className="page-subtitle">Fichas individuais, chamada diária e acompanhamento</div>
        </div>
        <div className="header-actions">
          {tab === 'fichas' && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Nova Criança</button>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, borderBottom: '1px solid var(--warm3)' }}>
        {[{ id: 'fichas', label: '📋 Fichas' }, { id: 'chamada', label: '✅ Chamada Diária' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '10px 18px', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--sage)' : 'transparent'}`, color: tab === t.id ? 'var(--ink)' : 'var(--ink3)', fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', fontSize: 13 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'fichas' && (
        <>
          {showForm && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">Cadastrar criança</div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Nome *</label><input className="form-input" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" /></div>
                <div className="form-group"><label className="form-label">Data de nascimento</label><input type="date" className="form-input" value={form.data_nascimento} onChange={e => setForm(p => ({ ...p, data_nascimento: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Entrada na escola Nacional</label><input type="date" className="form-input" value={form.data_entrada_escola} onChange={e => setForm(p => ({ ...p, data_entrada_escola: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Início no Integral (ano corrente)</label><input type="date" className="form-input" value={form.data_inicio_integral} onChange={e => setForm(p => ({ ...p, data_inicio_integral: e.target.value }))} /></div>
              </div>
              <div className="form-group">
                <label className="form-label">Dias contratados</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DIAS_SEMANA.map(d => {
                    const sel = form.dias.includes(d.id)
                    return (
                      <button key={d.id} onClick={() => toggleDiaForm(d.id)}
                        style={{ padding: '6px 14px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${sel ? '#4a7c59' : 'var(--warm3)'}`, background: sel ? '#e8f0eb' : '#fff', color: sel ? '#2d5240' : 'var(--ink3)', fontWeight: sel ? 600 : 400 }}>
                        {sel ? '✓ ' : ''}{d.full}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={criar}>Adicionar</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {[{ id: 'ativos', label: 'Ativos' }, { id: 'saidos', label: 'Saíram' }, { id: 'todos', label: 'Todos' }].map(f => (
              <button key={f.id} onClick={() => setFiltro(f.id)}
                style={{ padding: '5px 14px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${filtro === f.id ? 'var(--sage)' : 'var(--warm3)'}`, background: filtro === f.id ? '#e8f0eb' : '#fff', color: filtro === f.id ? '#2d5240' : 'var(--ink3)', fontWeight: filtro === f.id ? 600 : 400 }}>
                {f.label}
              </button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--ink4)', alignSelf: 'center', marginLeft: 'auto' }}>{filtradas.length} de {children.length}</span>
          </div>

          {filtradas.map(child => (
            <ChildCard key={child.id} child={child} onUpdate={updateChild} onAddObs={addChildObs} podeVerResponsaveis={podeVerResponsaveis} />
          ))}

          {filtradas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink3)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧒</div>
              <div style={{ fontSize: 15 }}>Nenhuma criança {filtro === 'ativos' ? 'ativa' : filtro === 'saidos' ? 'que saiu' : 'cadastrada'}.</div>
            </div>
          )}
        </>
      )}

      {tab === 'chamada' && <ChamadaDiaria criancas={children} />}
    </div>
  )
}
