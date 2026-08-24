/* Gera o HTML do relatório (mesmo layout do modelo original) para renderização no navegador. */

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nl2br(str = '') {
  return escapeHtml(str).replace(/\n/g, '<br>');
}

/**
 * data = {
 *   nomeClinica, responsavel, paciente, descricao,
 *   imagens: [{ dataUri }]
 * }
 */
function renderReportHtml(data) {
  const imagensHtml = (data.imagens || [])
    .map((img) => `<img class="rpt-report-image" src="${img.dataUri}" />`)
    .join('\n');

  return `
    <div class="rpt-page">
      <div class="rpt-header"><img src="assets/header-navy.png" /></div>
      <div class="rpt-gold-bar"></div>

      <div class="rpt-content">
        <div class="rpt-title-wrap">
          <div class="rpt-title-accent"></div>
          <h1 class="rpt-title">RELATÓRIO</h1>
          <h2 class="rpt-subtitle">ENDODÔNTICO</h2>
        </div>

        <div class="rpt-info-row">
          <div class="rpt-info-block">
            <img class="rpt-info-icon" src="assets/pin_icon.png" />
            <div>
              <p class="rpt-info-label">Clínica / Responsável</p>
              <p class="rpt-info-value">${escapeHtml(data.nomeClinica || '')}</p>
              <p class="rpt-info-value rpt-small">${escapeHtml(data.responsavel || '')}</p>
            </div>
          </div>
          <div class="rpt-info-block">
            <img class="rpt-info-icon" src="assets/person_icon.png" />
            <div>
              <p class="rpt-info-label">Paciente</p>
              <p class="rpt-info-value">${escapeHtml(data.paciente || '')}</p>
            </div>
          </div>
        </div>

        <hr class="rpt-divider" />

        <h3 class="rpt-section-title">Descrição do caso</h3>
        <div class="rpt-descricao-box">${nl2br(data.descricao || '')}</div>

        <hr class="rpt-dotted-divider" />

        <h3 class="rpt-section-title">Imagens</h3>
        <div class="rpt-imagens-wrap">
          ${imagensHtml}
        </div>
      </div>
    </div>
  `;
}
