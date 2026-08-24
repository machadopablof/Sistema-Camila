const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { chromium } = require('playwright');

const db = require('./db');
const { renderReportHtml } = require('./templates/report-template');

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOADS_DIR = path.join(__dirname, 'data', 'uploads');
const REPORTS_DIR = path.join(__dirname, 'data', 'reports');
[UPLOADS_DIR, REPORTS_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 15 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas arquivos de imagem são permitidos.'));
    }
    cb(null, true);
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/reports-files', express.static(REPORTS_DIR));

const CHROMIUM_PATH = '/opt/pw-browsers/chromium';
function getChromiumExecutablePath() {
  return fs.existsSync(CHROMIUM_PATH) ? CHROMIUM_PATH : undefined;
}

// ---------- Clínicas (banco de dados) ----------

app.get('/api/clinicas', (req, res) => {
  const rows = db.prepare('SELECT * FROM clinicas ORDER BY nome_clinica COLLATE NOCASE').all();
  res.json(rows);
});

app.post('/api/clinicas', (req, res) => {
  const { nome_clinica, responsavel, cro, endereco } = req.body || {};
  if (!nome_clinica || !responsavel) {
    return res.status(400).json({ error: 'nome_clinica e responsavel são obrigatórios.' });
  }
  const stmt = db.prepare(
    'INSERT INTO clinicas (nome_clinica, responsavel, cro, endereco) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(nome_clinica.trim(), responsavel.trim(), (cro || '').trim(), (endereco || '').trim());
  const row = db.prepare('SELECT * FROM clinicas WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.put('/api/clinicas/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM clinicas WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Clínica não encontrada.' });

  const { nome_clinica, responsavel, cro, endereco } = req.body || {};
  if (!nome_clinica || !responsavel) {
    return res.status(400).json({ error: 'nome_clinica e responsavel são obrigatórios.' });
  }
  db.prepare(
    'UPDATE clinicas SET nome_clinica = ?, responsavel = ?, cro = ?, endereco = ? WHERE id = ?'
  ).run(nome_clinica.trim(), responsavel.trim(), (cro || '').trim(), (endereco || '').trim(), id);
  res.json(db.prepare('SELECT * FROM clinicas WHERE id = ?').get(id));
});

app.delete('/api/clinicas/:id', (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM clinicas WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Clínica não encontrada.' });
  res.status(204).end();
});

// ---------- Relatórios (geração de PDF) ----------

app.get('/api/relatorios', (req, res) => {
  const rows = db.prepare('SELECT * FROM relatorios ORDER BY criado_em DESC').all();
  res.json(rows);
});

app.post('/api/relatorios/gerar', upload.array('imagens', 8), async (req, res) => {
  const uploadedFiles = req.files || [];
  try {
    const { nome_clinica, responsavel, paciente, descricao } = req.body || {};
    if (!nome_clinica || !responsavel || !paciente) {
      return res
        .status(400)
        .json({ error: 'Preencha ao menos a clínica, o(a) responsável e o paciente.' });
    }

    const imagens = uploadedFiles.map((f) => {
      const buffer = fs.readFileSync(f.path);
      const ext = (path.extname(f.originalname || '').slice(1) || 'png').toLowerCase();
      const mime = ext === 'jpg' ? 'jpeg' : ext;
      return { dataUri: `data:image/${mime};base64,${buffer.toString('base64')}` };
    });

    const html = renderReportHtml({
      nomeClinica: nome_clinica,
      responsavel,
      paciente,
      descricao,
      imagens,
    });

    const browser = await chromium.launch({ executablePath: getChromiumExecutablePath() });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });

    const fileName = `relatorio-${Date.now()}.pdf`;
    const filePath = path.join(REPORTS_DIR, fileName);
    await page.pdf({ path: filePath, format: 'A4', printBackground: true });
    await browser.close();

    db.prepare(
      `INSERT INTO relatorios (clinica_id, nome_clinica, responsavel, paciente, descricao, arquivo_pdf)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(req.body.clinica_id || null, nome_clinica, responsavel, paciente, descricao || '', fileName);

    res.json({ ok: true, arquivo: fileName, url: `/reports-files/${fileName}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao gerar o PDF: ' + err.message });
  } finally {
    uploadedFiles.forEach((f) => fs.unlink(f.path, () => {}));
  }
});

app.listen(PORT, () => {
  console.log(`Sistema Camila rodando em http://localhost:${PORT}`);
});
