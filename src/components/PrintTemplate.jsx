// Template de impressão fiel ao formato Micheline / Colégio Nacional
const LOGO_URL = 'https://static.wixstatic.com/media/69e7d2_ea11d63068d34e6ba1e0d23b8bcee0d8~mv2.jpg/v1/fill/w_100,h_65,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/69e7d2_ea11d63068d34e6ba1e0d23b8bcee0d8~mv2.jpg'

const DIAS_CORES = [
  { bg: '#2e7d4e', text: '#fff' }, // Verde escuro — Segunda
  { bg: '#1565c0', text: '#fff' }, // Azul — Terça
  { bg: '#6a1b9a', text: '#fff' }, // Roxo — Quarta
  { bg: '#e65100', text: '#fff' }, // Laranja — Quinta
  { bg: '#c62828', text: '#fff' }, // Vermelho — Sexta
]

export const CSS_IMPRESSAO = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600&display=swap');
  
  .print-container {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: #1e2420;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 16px;
  }

  .print-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    border-bottom: 2px solid #2d5240;
    padding-bottom: 8px;
  }

  .print-header-left h1 {
    font-family: 'Fraunces', serif;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #1e2420;
    margin: 0 0 3px 0;
  }

  .print-header-left .sub {
    font-size: 10px;
    font-style: italic;
    color: #c62828;
    font-weight: 600;
  }

  .print-header-logo {
    height: 40px;
    object-fit: contain;
  }

  .print-educadoras {
    background: #f0f7f2;
    border: 1px solid #c5d9c9;
    border-radius: 4px;
    padding: 6px 12px;
    margin-bottom: 10px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #2d5240;
    text-align: center;
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
    table-layout: fixed;
  }

  .print-table th {
    padding: 7px 6px;
    text-align: center;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border: 1px solid #ccc;
  }

  .print-table th.th-hora {
    background: #f5f5f5;
    width: 60px;
    color: #333;
  }

  .print-table td {
    border: 1px solid #ccc;
    padding: 6px 7px;
    vertical-align: top;
    font-size: 9px;
    line-height: 1.4;
  }

  .print-table td.td-hora {
    background: #f5f5f5;
    font-weight: 700;
    font-style: italic;
    color: #333;
    text-align: center;
    vertical-align: middle;
    font-size: 9px;
  }

  .print-table td.td-fixo {
    background: #f9f9f9;
    color: #555;
  }

  .cell-titulo {
    font-weight: 700;
    text-transform: uppercase;
    font-size: 8.5px;
    letter-spacing: 0.3px;
    margin-bottom: 3px;
  }

  .cell-local {
    font-style: italic;
    font-size: 8px;
    color: #555;
    text-transform: uppercase;
    margin-bottom: 3px;
  }

  .cell-desc {
    font-size: 8.5px;
    line-height: 1.45;
    color: #1e2420;
    white-space: pre-wrap;
  }

  .cell-bncc {
    margin-top: 4px;
    font-size: 7.5px;
    color: #4a7c59;
    font-weight: 600;
  }

  .print-footer {
    border-top: 1px solid #ccc;
    padding-top: 8px;
    font-size: 9px;
    line-height: 1.5;
    color: #1e2420;
  }

  .print-footer strong {
    font-weight: 700;
    font-style: italic;
    color: #4a7c59;
  }

  .print-footer-obs {
    color: #c62828;
    font-weight: 700;
    font-style: italic;
  }

  .print-reflexao {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-top: 8px;
  }

  .print-reflexao-box {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 6px 8px;
  }

  .print-reflexao-box .label {
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #2d5240;
    margin-bottom: 3px;
  }

  .print-reflexao-box .lines {
    border-bottom: 1px solid #e0e0e0;
    height: 14px;
    margin-bottom: 2px;
  }

  @media print {
    @page { size: A4 landscape; margin: 10mm 8mm; }
    body { margin: 0; }
    .no-print { display: none !important; }
    .print-container { padding: 0; }
  }
`

export function gerarHTMLPlanejamento(dados) {
  const { semana, educadorasRef, educadorasApoio, slots, propostas, observacao, revisao, ajustes, reflexao } = dados

  const diasHeader = ['SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA']

  // Formatar data da semana
  let dataTexto = 'Semana atual'
  if (semana) {
    const d = new Date(semana + 'T12:00:00')
    const fim = new Date(d)
    fim.setDate(fim.getDate() + 4)
    const opts = { day: '2-digit', month: '2-digit' }
    dataTexto = `${d.toLocaleDateString('pt-BR', opts)} a ${fim.toLocaleDateString('pt-BR', opts)} de ${fim.getFullYear()}`
  }

  const rows = slots.map(slot => {
    const isFixo = ['Café da manhã', 'Almoço', 'Escovação', 'Chegada'].some(k =>
      slot.cells[0]?.toLowerCase().includes(k.toLowerCase())
    )

    const cells = slot.cells.map((cell, ci) => {
      if (!cell || cell === '...' || cell.trim() === '') {
        if (isFixo && ci > 0) {
          const cor = DIAS_CORES[ci - 1]
          return `<td class="td-fixo" style="color:${cor.bg};font-style:italic;text-align:center">(${slot.cells[0] || '...'})</td>`
        }
        return `<td></td>`
      }

      // Detectar se tem título em maiúsculas e descrição
      const linhas = cell.split('\n')
      const isBold = linhas[0] === linhas[0].toUpperCase() && linhas[0].length > 3

      // Extrair BNCC codes
      const bnccMatch = cell.match(/EI0\d[A-Z]{2}\d{2}/g)
      const bnccStr = bnccMatch ? bnccMatch.join(' · ') : ''
      const textoSemBNCC = cell.replace(/EI0\d[A-Z]{2}\d{2}[:\s]*/g, '').trim()

      const cor = DIAS_CORES[ci - 1] || DIAS_CORES[0]

      return `<td style="border:1px solid #ccc;padding:6px 7px;vertical-align:top">
        ${isBold ? `<div class="cell-titulo" style="color:${cor.bg}">${linhas[0]}</div>` : ''}
        <div class="cell-desc">${textoSemBNCC.replace(linhas[0], '').trim() || textoSemBNCC}</div>
        ${bnccStr ? `<div class="cell-bncc">${bnccStr}</div>` : ''}
      </td>`
    })

    return `<tr>
      <td class="td-hora">${slot.h}</td>
      ${cells.join('')}
    </tr>`
  }).join('')

  const thHeaders = diasHeader.map((dia, i) => {
    const cor = DIAS_CORES[i]
    return `<th style="background:${cor.bg};color:${cor.text}">${dia}</th>`
  }).join('')

  const footerText = [
    propostas ? `<strong>PROPOSTAS:</strong> ${propostas}` : '',
    observacao ? `<span class="print-footer-obs">OBSERVAÇÃO:</span> ${observacao}` : '',
    revisao ? `<strong>REVISÃO SEMANAL:</strong> ${revisao}` : '',
    ajustes ? `<strong>AJUSTES NECESSÁRIOS:</strong> ${ajustes}` : '',
  ].filter(Boolean).join(' ')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Planejamento — ${dataTexto}</title>
<style>${CSS_IMPRESSAO}</style>
</head>
<body>
<div class="print-container">

  <div class="print-header">
    <div class="print-header-left">
      <h1>Planejamento do Cotidiano – Período Integral<br>Educação Infantil 2026</h1>
      <div class="sub">*Sujeito a alterações</div>
    </div>
    <img class="print-header-logo" src="${LOGO_URL}" alt="Colégio Nacional" onerror="this.style.display='none'" />
  </div>

  <div class="print-educadoras">
    EDUCADORAS DE REFERÊNCIA: ${educadorasRef || 'MICHELINE E ÉRICA'} /
    EDUCADORAS DE APOIO: ${educadorasApoio || 'HALYSSA E DAYANE'}
  </div>

  <table class="print-table">
    <thead>
      <tr>
        <th class="th-hora">HORÁRIO</th>
        ${thHeaders}
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  ${footerText ? `<div class="print-footer">${footerText}</div>` : ''}

  <div class="print-reflexao">
    <div class="print-reflexao-box">
      <div class="label">💭 Revisão semanal</div>
      ${[1,2,3].map(() => '<div class="lines"></div>').join('')}
      <div style="font-size:8px;color:#999;margin-top:2px">${revisao || ''}</div>
    </div>
    <div class="print-reflexao-box">
      <div class="label">🔧 Ajustes necessários</div>
      ${[1,2,3].map(() => '<div class="lines"></div>').join('')}
      <div style="font-size:8px;color:#999;margin-top:2px">${ajustes || ''}</div>
    </div>
    <div class="print-reflexao-box">
      <div class="label">💭 Reflexão da professora</div>
      ${[1,2,3].map(() => '<div class="lines"></div>').join('')}
      <div style="font-size:8px;color:#999;margin-top:2px">${reflexao || ''}</div>
    </div>
  </div>

</div>
</body>
</html>`
}

export default function PrintPreview({ dados, onClose }) {
  const html = gerarHTMLPlanejamento(dados)

  function imprimir() {
    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--warm3)' }} className="no-print">
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16 }}>Prévia de Impressão — Padrão Colégio Nacional</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={imprimir}>🖨️ Imprimir</button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Fechar</button>
        </div>
      </div>
      <iframe
        srcDoc={html}
        style={{ flex: 1, border: 'none', background: '#f0f0f0' }}
        title="Prévia do planejamento"
      />
    </div>
  )
}
