const fs = require('fs');
const path = require('path');

function toDataUri(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  const b64 = fs.readFileSync(filePath).toString('base64');
  return `data:image/${mime};base64,${b64}`;
}

const ASSETS = path.join(__dirname, '..', 'public', 'assets');
const HEADER_LOGO = toDataUri(path.join(ASSETS, 'header-navy.png'));
const PIN_ICON = toDataUri(path.join(ASSETS, 'pin_icon.png'));
const PERSON_ICON = toDataUri(path.join(ASSETS, 'person_icon.png'));

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
    .map((img) => `<img class="report-image" src="${img.dataUri}" />`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
    color: #14142b;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    position: relative;
    background: #ffffff;
  }
  .header {
    width: 100%;
    display: block;
  }
  .header img {
    width: 100%;
    display: block;
  }
  .gold-bar {
    width: 100%;
    height: 6mm;
    background: #FECC51;
  }
  .content {
    padding: 10mm 18mm 14mm 18mm;
  }
  .title-wrap {
    position: relative;
    margin-top: 8mm;
    min-height: 26mm;
  }
  .title-accent {
    position: absolute;
    left: -18mm;
    top: 6mm;
    width: 34mm;
    height: 12mm;
    background: #FECC51;
  }
  .title {
    position: relative;
    margin: 0;
    padding-top: 4mm;
    font-size: 34pt;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: #0a0a26;
    line-height: 1.05;
  }
  .subtitle {
    position: relative;
    margin: 0;
    font-size: 22pt;
    font-weight: 400;
    color: #0a0a26;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 10mm;
    gap: 10mm;
  }
  .info-block {
    display: flex;
    align-items: center;
    gap: 4mm;
    flex: 1;
  }
  .info-icon {
    width: 16mm;
    height: 16mm;
    flex-shrink: 0;
  }
  .info-label {
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #8a8a99;
    margin: 0 0 1mm 0;
  }
  .info-value {
    font-size: 12pt;
    font-weight: 700;
    color: #0a0a26;
    margin: 0;
    word-break: break-word;
  }
  .info-value.small {
    font-size: 10pt;
    font-weight: 400;
    color: #333349;
  }
  .divider {
    border: none;
    border-top: 1.2px solid #d0d0d5;
    margin: 8mm 0 6mm 0;
  }
  .dotted-divider {
    border: none;
    border-top: 2.5px dotted #cfcfd4;
    margin: 8mm 0 6mm 0;
  }
  .section-title {
    font-size: 15pt;
    font-weight: 800;
    color: #0a0a26;
    margin: 0 0 5mm 0;
  }
  .descricao-box {
    font-size: 11pt;
    line-height: 1.6;
    color: #22222f;
    white-space: pre-wrap;
    min-height: 30mm;
  }
  .imagens-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 4mm;
  }
  .report-image {
    max-width: 100%;
    width: 100%;
    max-height: 140mm;
    object-fit: contain;
    border: 1px solid #eaeaea;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="header"><img src="${HEADER_LOGO}" /></div>
    <div class="gold-bar"></div>

    <div class="content">
      <div class="title-wrap">
        <div class="title-accent"></div>
        <h1 class="title">RELATÓRIO</h1>
        <h2 class="subtitle">ENDODÔNTICO</h2>
      </div>

      <div class="info-row">
        <div class="info-block">
          <img class="info-icon" src="${PIN_ICON}" />
          <div>
            <p class="info-label">Clínica / Responsável</p>
            <p class="info-value">${escapeHtml(data.nomeClinica || '')}</p>
            <p class="info-value small">${escapeHtml(data.responsavel || '')}</p>
          </div>
        </div>
        <div class="info-block">
          <img class="info-icon" src="${PERSON_ICON}" />
          <div>
            <p class="info-label">Paciente</p>
            <p class="info-value">${escapeHtml(data.paciente || '')}</p>
          </div>
        </div>
      </div>

      <hr class="divider" />

      <h3 class="section-title">Descrição do caso</h3>
      <div class="descricao-box">${nl2br(data.descricao || '')}</div>

      <hr class="dotted-divider" />

      <h3 class="section-title">Imagens</h3>
      <div class="imagens-wrap">
        ${imagensHtml}
      </div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { renderReportHtml };
