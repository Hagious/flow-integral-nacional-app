import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'

const LOGO_URL = 'https://static.wixstatic.com/media/69e7d2_ea11d63068d34e6ba1e0d23b8bcee0d8~mv2.jpg/v1/fill/w_100,h_65,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/69e7d2_ea11d63068d34e6ba1e0d23b8bcee0d8~mv2.jpg'
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

// ─── IA: Sugerir momentos do Jornal ─────────────────────────
async function sugerirMomentos(diario, planejamentos, mes, ano) {
  const resumos = diario
    .filter(d => { const dt = new Date(d.data); return dt.getMonth() + 1 === mes && dt.getFullYear() === ano })
    .map(d => `${d.data}: ${d.resumo || ''}`)
    .filter(d => d.length > 15)
    .slice(0, 10)
    .join('\n')

  const prompt = `Você é especialista em documentação pedagógica Reggio Emilia.

Com base nos registros do Diário Fotográfico do mês de ${MESES[mes-1]}/${ano}:

${resumos || 'Registros do mês de ' + MESES[mes-1]}

Sugira 4 atividades/momentos para o Jornal Literário mensal do Colégio Nacional — Período Integral.

Cada item deve ter:
- titulo: nome da atividade (máx 5 palavras)
- emoji: emoji representativo
- texto: descrição narrativa pedagógica de 3-4 frases, linguagem acessível para famílias, no espírito Reggio Emilia

Retorne SOMENTE um array JSON válido:
[{"titulo":"...","emoji":"...","texto":"..."},...]
Nenhum texto antes ou depois.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    const text = data.content?.[0]?.text || '[]'
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch { return null }
}

// ─── Template de impressão do Jornal ─────────────────────────
function gerarHTMLJornal(jornal) {
  const mesNome = MESES[jornal.mes - 1]

  const atividadesHTML = (jornal.atividades || []).map(a => `
    <div class="ativ-block">
      <div class="ativ-header">
        <span class="ativ-emoji">${a.emoji || '🌿'}</span>
        <h3 class="ativ-title">${a.titulo || 'Atividade'}</h3>
      </div>
      <p class="ativ-texto">${(a.texto || '').replace(/\n/g, '<br>')}</p>
      ${a.fotos?.length ? `
        <div class="ativ-fotos">
          ${a.fotos.map(f => `<img src="${f.url}" alt="${f.legenda||''}" class="ativ-foto" />`).join('')}
        </div>` : ''}
      ${a.fotos?.length ? `<div class="fotos-caption">${a.fotos.map(f => f.legenda).filter(Boolean).join(' · ')}</div>` : ''}
    </div>`).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Jornal Literário — ${mesNome} ${jornal.ano}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;font-size:11px;color:#1e2420;background:#fff;padding:0}
  .page{max-width:794px;margin:0 auto;padding:24px 28px;min-height:1123px;position:relative}

  /* Capa */
  .capa{background:linear-gradient(160deg,#2d5240 0%,#4a7c59 55%,#6a9e74 100%);border-radius:16px;padding:32px 36px 28px;margin-bottom:24px;color:#fff;position:relative;overflow:hidden}
  .capa::before{content:'';position:absolute;right:-40px;top:-40px;width:220px;height:220px;background:rgba(255,255,255,0.05);border-radius:50%}
  .capa::after{content:'';position:absolute;right:40px;bottom:-60px;width:140px;height:140px;background:rgba(255,255,255,0.04);border-radius:50%}
  .capa-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
  .capa-logo{height:36px;object-fit:contain;filter:brightness(0) invert(1);opacity:0.9}
  .capa-aviso{font-size:9px;opacity:0.6;text-transform:uppercase;letter-spacing:1px;text-align:right;margin-top:4px}
  .capa-main{position:relative;z-index:1}
  .capa-label{font-size:9px;text-transform:uppercase;letter-spacing:2px;opacity:0.65;margin-bottom:8px}
  .capa-titulo{font-family:'Fraunces',serif;font-size:36px;font-weight:400;line-height:1.1;letter-spacing:-0.5px;margin-bottom:10px}
  .capa-subtitulo{font-size:13px;opacity:0.8;font-style:italic}
  .capa-bottom{display:flex;gap:14px;margin-top:20px;position:relative;z-index:1}
  .capa-chip{background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:4px 14px;font-size:10px;font-weight:500}

  /* Frase de abertura */
  .frase-abertura{background:#f5eedc;border-left:4px solid #b8923a;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:22px}
  .frase-abertura p{font-family:'Fraunces',serif;font-style:italic;font-size:13px;color:#3d2a00;line-height:1.7}
  .frase-abertura cite{display:block;font-size:10px;color:#6b4a0a;margin-top:6px;text-align:right;font-style:normal}

  /* Atividades */
  .ativ-block{margin-bottom:20px;padding-bottom:18px;border-bottom:1px dashed #ddd6c8;page-break-inside:avoid}
  .ativ-block:last-child{border-bottom:none}
  .ativ-header{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .ativ-emoji{font-size:22px;width:36px;height:36px;background:#e8f0eb;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .ativ-title{font-family:'Fraunces',serif;font-size:16px;font-weight:500;color:#2d5240;line-height:1.2}
  .ativ-texto{font-size:11px;line-height:1.75;color:#3d4a42;text-align:justify}
  .ativ-fotos{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:10px}
  .ativ-foto{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid #ddd6c8}
  .fotos-caption{font-size:9px;color:#9aaa9f;margin-top:4px;font-style:italic;text-align:center}

  /* Seção de encerramento */
  .encerramento{background:#e8f0eb;border-radius:12px;padding:16px 18px;margin-top:20px;display:flex;gap:14px;align-items:flex-start}
  .enc-icon{font-size:24px;flex-shrink:0}
  .enc-titulo{font-family:'Fraunces',serif;font-size:13px;font-weight:500;color:#2d5240;margin-bottom:4px}
  .enc-texto{font-size:10px;color:#3d4a42;line-height:1.65}

  /* Rodapé */
  .rodape{margin-top:24px;padding-top:14px;border-top:1px solid #ddd6c8;display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#9aaa9f}
  .rodape-escola{font-weight:500;color:#6b7a6f}

  @media print{
    @page{size:A4;margin:10mm}
    body{padding:0}
    .page{max-width:100%;padding:0}
    .no-print{display:none!important}
  }
</style>
</head>
<body>
<div class="page">
  <div class="capa">
    <div class="capa-top">
      <div>
        <div class="capa-label">Período Integral · Educação Infantil</div>
        <div class="capa-titulo">Jornal<br>Literário</div>
      </div>
      <div style="text-align:right">
        <img class="capa-logo" src="${LOGO_URL}" alt="Colégio Nacional" onerror="this.style.display='none'">
        <div class="capa-aviso">Colégio Nacional</div>
      </div>
    </div>
    <div class="capa-main">
      <div class="capa-subtitulo">${mesNome} de ${jornal.ano}</div>
    </div>
    <div class="capa-bottom">
      <span class="capa-chip">🌿 ${jornal.turma || 'Período Integral'}</span>
      ${jornal.numCriancas ? `<span class="capa-chip">👦 ${jornal.numCriancas} crianças</span>` : ''}
      <span class="capa-chip">📅 ${mesNome}/${jornal.ano}</span>
    </div>
  </div>

  <div class="frase-abertura">
    <p>"A criança tem cem línguas, cem mãos, cem pensamentos — cem modos de escutar, de se maravilhar, de amar."</p>
    <cite>— Loris Malaguzzi</cite>
  </div>

  ${atividadesHTML || '<p style="color:#9aaa9f;font-style:italic;text-align:center;padding:40px">Nenhuma atividade adicionada ainda.</p>'}

  <div class="encerramento">
    <div class="enc-icon">🌱</div>
    <div>
      <div class="enc-titulo">Até o próximo mês!</div>
      <div class="enc-texto">Cada dia no Período Integral é uma nova oportunidade de descoberta. Obrigada por confiarem suas crianças ao nosso cuidado. Continuamos aprendendo juntos!</div>
    </div>
  </div>

  <div class="rodape">
    <span class="rodape-escola">Colégio Nacional · Educação para Sempre</span>
    <span>Período Integral · ${mesNome} de ${jornal.ano}</span>
  </div>
</div>
</body>
</html>`
}

// ─── Componente AtividadeEditor ───────────────────────────────
function AtividadeEditor({ ativ, idx, onChange, onRemove, onAddFoto }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--warm3)', borderRadius: 'var(--r)', padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <input
          style={{ width: 52, padding: '8px', border: '1px solid var(--warm3)', borderRadius: 8, fontSize: 22, textAlign: 'center', background: 'var(--warm)', cursor: 'text' }}
          value={ativ.emoji || '🌿'}
          onChange={e => onChange(idx, 'emoji', e.target.value)}
          placeholder="🌿"
        />
        <input
          className="form-input"
          style={{ flex: 1, fontFamily: 'Fraunces, serif', fontSize: 15 }}
          value={ativ.titulo || ''}
          onChange={e => onChange(idx, 'titulo', e.target.value)}
          placeholder="Título da atividade..."
        />
        <button onClick={() => onRemove(idx)} style={{ background: '#fce8e8', border: 'none', borderRadius: 8, width: 36, cursor: 'pointer', color: '#a32d2d', fontSize: 14 }}>✕</button>
      </div>
      <textarea
        className="form-input"
        style={{ minHeight: 90, fontSize: 12, lineHeight: 1.7 }}
        value={ativ.texto || ''}
        onChange={e => onChange(idx, 'texto', e.target.value)}
        placeholder="Descreva a atividade em linguagem narrativa para as famílias... Use 'Gerar com IA' para criar automaticamente."
      />
      {ativ.fotos?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {ativ.fotos.map((f, fi) => (
            <div key={fi} style={{ position: 'relative' }}>
              <img src={f.url} alt={f.legenda} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--warm3)' }} />
              <button
                onClick={() => onChange(idx, 'fotos', ativ.fotos.filter((_, i) => i !== fi))}
                style={{ position: 'absolute', top: -6, right: -6, background: '#a32d2d', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────
export default function JornalLiterario() {
  const { diario, jornais, saveJornal, showToast } = useApp()
  const now = new Date()

  const [mesAtual, setMesAtual] = useState(now.getMonth() + 1)
  const [anoAtual, setAnoAtual] = useState(now.getFullYear())
  const [showPreview, setShowPreview] = useState(false)
  const [loadingIA, setLoadingIA] = useState(false)

  // Jornal do mês atual ou novo
  const jornalExistente = useMemo(
    () => jornais.find(j => j.mes === mesAtual && j.ano === anoAtual),
    [jornais, mesAtual, anoAtual]
  )

  const [jornal, setJornal] = useState(() => jornalExistente || {
    titulo: 'Jornal Literário',
    mes: mesAtual,
    ano: anoAtual,
    turma: 'Período Integral',
    numCriancas: 12,
    atividades: [
      { emoji: '🌿', titulo: 'Assembleia das Crianças', texto: 'As crianças participaram ativamente da votação do nome da turma, discutindo as características de cada pássaro. Surgiram hipóteses riquíssimas sobre os hábitos dos animais e a relação deles com a escola. A escuta atenta de cada voz revelou o quanto as crianças são protagonistas do próprio aprendizado.' },
      { emoji: '🌱', titulo: 'Vivência na Horta', texto: 'Em pequenos grupos, as crianças realizaram a colheita e manutenção dos canteiros, desenvolvendo cooperação, responsabilidade e conexão com a natureza. Cada momento na horta é uma descoberta — sobre o solo, sobre o cuidado, sobre o tempo que as coisas levam para crescer.' },
    ],
    publicado: false,
  })

  // Sincroniza quando muda de mês
  const trocarMes = (mes, ano) => {
    setMesAtual(mes)
    setAnoAtual(ano)
    const encontrado = jornais.find(j => j.mes === mes && j.ano === ano)
    setJornal(encontrado || {
      titulo: 'Jornal Literário', mes, ano,
      turma: 'Período Integral', numCriancas: 12,
      atividades: [], publicado: false,
    })
  }

  function updateAtiv(idx, campo, valor) {
    setJornal(p => {
      const ats = [...p.atividades]
      ats[idx] = { ...ats[idx], [campo]: valor }
      return { ...p, atividades: ats }
    })
  }

  function removeAtiv(idx) {
    setJornal(p => ({ ...p, atividades: p.atividades.filter((_, i) => i !== idx) }))
  }

  function addAtiv() {
    setJornal(p => ({
      ...p,
      atividades: [...(p.atividades || []), { emoji: '⭐', titulo: '', texto: '', fotos: [] }]
    }))
  }

  async function handleSugerirIA() {
    setLoadingIA(true)
    showToast('✨ IA sugerindo momentos do mês...')
    const sugestoes = await sugerirMomentos(diario, [], mesAtual, anoAtual)
    if (sugestoes?.length) {
      setJornal(p => ({
        ...p,
        atividades: [
          ...(p.atividades || []),
          ...sugestoes.map(s => ({ ...s, fotos: [] }))
        ]
      }))
      showToast(`✅ ${sugestoes.length} momentos sugeridos pela IA!`)
    } else {
      showToast('⚠️ Nenhum registro do mês encontrado. Adicione entradas no Diário Fotográfico.')
    }
    setLoadingIA(false)
  }

  async function handleSalvar() {
    await saveJornal(jornal)
    showToast('💾 Jornal salvo!')
  }

  function handleImprimir() {
    const html = gerarHTMLJornal(jornal)
    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 600)
  }

  const mesesDisponiveis = MESES.map((m, i) => ({ label: m, mes: i + 1, ano: anoAtual }))

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="title-icon">📰</span> Jornal Literário</div>
          <div className="page-subtitle">Publicação mensal para as famílias — substitui o Canva</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleSugerirIA} disabled={loadingIA}>
            {loadingIA ? '⏳ Gerando...' : '✨ Sugerir com IA'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleSalvar}>💾 Salvar</button>
          <button className="btn btn-primary btn-sm" onClick={handleImprimir}>🖨️ Imprimir / PDF</button>
        </div>
      </div>

      {/* Seletor de mês */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {mesesDisponiveis.map(m => {
          const temJornal = jornais.some(j => j.mes === m.mes && j.ano === m.ano)
          return (
            <button
              key={m.mes}
              onClick={() => trocarMes(m.mes, m.ano)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                border: `1.5px solid ${mesAtual === m.mes ? 'var(--sage)' : 'var(--warm3)'}`,
                background: mesAtual === m.mes ? 'var(--sage-light)' : '#fff',
                color: mesAtual === m.mes ? 'var(--sage-dark)' : 'var(--ink3)',
                fontWeight: mesAtual === m.mes ? 600 : 400,
                position: 'relative',
              }}
            >
              {m.label}
              {temJornal && <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, background: 'var(--sage)', borderRadius: '50%' }} />}
            </button>
          )
        })}
      </div>

      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        {/* EDITOR */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">⚙️ Configurações do Jornal</div>
            <div className="grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Turma</label>
                <input className="form-input" value={jornal.turma || ''} onChange={e => setJornal(p => ({ ...p, turma: e.target.value }))} placeholder="Período Integral" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nº de crianças</label>
                <input type="number" className="form-input" value={jornal.numCriancas || ''} onChange={e => setJornal(p => ({ ...p, numCriancas: Number(e.target.value) }))} placeholder="12" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16 }}>Atividades do mês</div>
            <span style={{ fontSize: 12, color: 'var(--ink3)' }}>{jornal.atividades?.length || 0} atividades</span>
          </div>

          {(jornal.atividades || []).map((a, i) => (
            <AtividadeEditor
              key={i} ativ={a} idx={i}
              onChange={updateAtiv}
              onRemove={removeAtiv}
            />
          ))}

          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
            onClick={addAtiv}
          >
            + Adicionar atividade
          </button>
        </div>

        {/* PREVIEW */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16 }}>Prévia</div>
            <button className="btn btn-primary btn-sm" onClick={handleImprimir}>🖨️ Imprimir</button>
          </div>

          {/* Mini preview */}
          <div style={{
            background: 'linear-gradient(160deg,#2d5240,#4a7c59 55%,#6a9e74)',
            borderRadius: 16, padding: '20px 22px', marginBottom: 12, color: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.65, marginBottom: 6 }}>Período Integral · Ed. Infantil</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 400, lineHeight: 1.1 }}>Jornal<br/>Literário</div>
                <div style={{ fontSize: 11, opacity: 0.8, fontStyle: 'italic', marginTop: 6 }}>{MESES[mesAtual-1]} de {anoAtual}</div>
              </div>
              <img src={LOGO_URL} alt="CN" style={{ height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85 }} onError={e => e.target.style.display='none'} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 12px', fontSize: 10 }}>🌿 {jornal.turma || 'Período Integral'}</span>
              {jornal.numCriancas && <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 12px', fontSize: 10 }}>👦 {jornal.numCriancas} crianças</span>}
            </div>
          </div>

          <div style={{ background: '#f5eedc', borderLeft: '4px solid #b8923a', borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 11, color: '#3d2a00', lineHeight: 1.6 }}>
              "A criança tem cem línguas, cem mãos, cem pensamentos..."
            </div>
            <div style={{ fontSize: 10, color: '#6b4a0a', marginTop: 4, textAlign: 'right' }}>— Loris Malaguzzi</div>
          </div>

          {(jornal.atividades || []).map((a, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--warm3)', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{a.emoji || '🌿'}</span>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 13, color: 'var(--sage-dark)', fontWeight: 500 }}>{a.titulo || 'Atividade sem título'}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink2)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {a.texto || ''}
              </div>
            </div>
          ))}

          {(!jornal.atividades || jornal.atividades.length === 0) && (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--ink4)', fontSize: 13, background: 'var(--warm)', borderRadius: 10 }}>
              Adicione atividades para ver a prévia
            </div>
          )}

          <div style={{ background: 'var(--sage-light)', borderRadius: 10, padding: '10px 14px', marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--sage-dark)', marginBottom: 3 }}>🌱 Até o próximo mês!</div>
            <div style={{ fontSize: 10, color: 'var(--ink2)', lineHeight: 1.5 }}>Cada dia é uma nova oportunidade de descoberta. Obrigada pela confiança!</div>
          </div>

          <div style={{ marginTop: 8, padding: '8px 0', borderTop: '1px solid var(--warm3)', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink4)' }}>
            <span>Colégio Nacional · Educação para Sempre</span>
            <span>{MESES[mesAtual-1]} de {anoAtual}</span>
          </div>
        </div>
      </div>

      {/* Histórico de jornais */}
      {jornais.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <hr className="divider" />
          <div className="sec-title" style={{ marginBottom: 14 }}>📁 Jornais anteriores</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {jornais.map(j => (
              <button
                key={j.id || `${j.mes}-${j.ano}`}
                onClick={() => trocarMes(j.mes, j.ano)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', background: '#fff', border: '1px solid var(--warm3)',
                  borderRadius: 10, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--sage-mid)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--warm3)'}
              >
                <span>📰</span>
                <span>{MESES[j.mes - 1]} {j.ano}</span>
                <span style={{ fontSize: 11, color: 'var(--ink3)' }}>· {j.atividades?.length || 0} atividades</span>
                {j.publicado && <span style={{ fontSize: 10, background: 'var(--sage-light)', color: 'var(--sage-dark)', padding: '1px 8px', borderRadius: 10 }}>Publicado</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
