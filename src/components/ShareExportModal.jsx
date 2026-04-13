import { useState, useMemo } from 'react'

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }

/**
 * Modal reutilizável de compartilhamento e exportação.
 * Props:
 *   - aberto (bool)
 *   - onClose ()
 *   - titulo (string) — ex: "Relatório de Ocorrências"
 *   - subtitulo (string) — ex: "Abril 2026 · 12 ocorrências"
 *   - conteudoTexto (string) — texto plano usado em mailto/copiar
 *   - conteudoPreview (jsx) — prévia visual dentro do modal e na impressão
 *   - linkRelativo (string) — hint de navegação (ex: "Planejamento > semana 13/04")
 */
export default function ShareExportModal({ aberto, onClose, titulo, subtitulo, conteudoTexto, conteudoPreview, linkRelativo }) {
  const [destinatarios, setDestinatarios] = useState([])
  const [mensagemExtra, setMensagemExtra] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const usuarios = useMemo(() => lsGet('integral_usuarios', []).filter(u => u.ativo && u.email), [aberto])
  const urlApp = typeof window !== 'undefined' ? window.location.href : ''

  function toggleDestinatario(email) {
    setDestinatarios(p => p.includes(email) ? p.filter(x => x !== email) : [...p, email])
  }

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2200)
  }

  function montarCorpoEmail() {
    const linhas = [
      `${titulo}`,
      subtitulo ? `${subtitulo}` : '',
      '',
      mensagemExtra ? `${mensagemExtra}\n` : '',
      '— Conteúdo —',
      conteudoTexto || '',
      '',
      linkRelativo ? `Onde encontrar no sistema: ${linkRelativo}` : '',
      `Abrir no sistema: ${urlApp}`,
      '',
      '— Colégio Nacional · Integral —',
    ].filter(Boolean)
    return linhas.join('\n')
  }

  function abrirEmail() {
    const to = destinatarios.join(',')
    const subject = encodeURIComponent(titulo + (subtitulo ? ` — ${subtitulo}` : ''))
    const body = encodeURIComponent(montarCorpoEmail())
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
    showToast('Abrindo cliente de e-mail...')
  }

  function copiarTexto() {
    navigator.clipboard?.writeText(montarCorpoEmail()).then(
      () => showToast('Texto copiado'),
      () => showToast('Falha ao copiar')
    )
  }

  function copiarLink() {
    navigator.clipboard?.writeText(urlApp).then(
      () => showToast('Link copiado'),
      () => showToast('Falha ao copiar')
    )
  }

  function imprimir() {
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) { showToast('Desbloqueie popups para imprimir'); return }
    const htmlPreview = document.getElementById('share-export-preview')?.innerHTML || conteudoTexto
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${titulo}</title>
      <style>
        body { font-family: Georgia, serif; color: #1e2420; padding: 32px; max-width: 800px; margin: 0 auto; line-height: 1.55; }
        h1 { font-size: 22px; margin: 0 0 6px; }
        .sub { font-size: 13px; color: #666; margin-bottom: 20px; }
        .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 11px; color: #888; }
        pre, .pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 12px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        th { background: #f5f0e6; }
        @media print { body { padding: 16px; } }
      </style>
    </head><body>
      <h1>${titulo}</h1>
      ${subtitulo ? `<div class="sub">${subtitulo}</div>` : ''}
      <div>${htmlPreview}</div>
      <div class="footer">Colégio Nacional — Educação para Sempre · Gerado pelo sistema Integral em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
    </body></html>`)
    w.document.close()
    setTimeout(() => { w.print() }, 250)
  }

  if (!aberto) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 780, maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: 'var(--ink)' }}>📤 Compartilhar / Exportar</div>
            <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 2 }}>{titulo}{subtitulo && ` · ${subtitulo}`}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink3)' }}>✕</button>
        </div>

        {/* Destinatários */}
        <div style={{ background: 'var(--warm)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }}>Destinatários (e-mail)</div>
          {usuarios.length === 0 && <div style={{ fontSize: 11, color: 'var(--ink4)', fontStyle: 'italic' }}>Nenhum usuário com e-mail cadastrado. Cadastre e-mails em "Usuários e Acessos".</div>}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {usuarios.map(u => {
              const sel = destinatarios.includes(u.email)
              return (
                <button key={u.id} type="button" onClick={() => toggleDestinatario(u.email)}
                  style={{ padding: '5px 12px', borderRadius: 14, fontSize: 11, cursor: 'pointer', border: `1.5px solid ${sel ? 'var(--sage)' : 'var(--warm3)'}`, background: sel ? 'var(--sage-light)' : '#fff', color: sel ? 'var(--sage-dark)' : 'var(--ink3)', fontWeight: sel ? 600 : 400 }}>
                  {sel ? '✓ ' : ''}{u.nome}
                </button>
              )
            })}
          </div>
          {destinatarios.length > 0 && (
            <div style={{ fontSize: 10, color: 'var(--ink4)', marginTop: 6 }}>Para: {destinatarios.join(', ')}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Mensagem adicional (opcional)</label>
          <textarea className="form-input" style={{ minHeight: 50 }} value={mensagemExtra} onChange={e => setMensagemExtra(e.target.value)} placeholder="Ex: Boa noite, segue o planejamento da semana..." />
        </div>

        {/* Prévia */}
        <div style={{ background: '#fff', border: '1px solid var(--warm3)', borderRadius: 8, padding: 16, marginBottom: 14, maxHeight: 260, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--ink4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Prévia</div>
          <div id="share-export-preview" style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.6 }}>
            {conteudoPreview || <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{conteudoTexto}</pre>}
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={copiarLink}>🔗 Copiar link</button>
          <button className="btn btn-ghost btn-sm" onClick={copiarTexto}>📋 Copiar texto</button>
          <button className="btn btn-ghost btn-sm" onClick={imprimir}>🖨️ Imprimir / PDF</button>
          <button className="btn btn-primary btn-sm" onClick={abrirEmail} disabled={destinatarios.length === 0} style={{ opacity: destinatarios.length === 0 ? 0.5 : 1 }}>
            📧 Enviar por e-mail
          </button>
        </div>

        {toastMsg && (
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', padding: '8px 16px', background: 'var(--ink)', color: '#fff', borderRadius: 20, fontSize: 12 }}>
            {toastMsg}
          </div>
        )}

        <div style={{ marginTop: 14, fontSize: 10, color: 'var(--ink4)', textAlign: 'center' }}>
          ℹ️ O envio usa o cliente de e-mail do sistema (mailto). Para PDF: clique "Imprimir" → "Salvar como PDF" e anexe no e-mail.
        </div>
      </div>
    </div>
  )
}
