const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'sistema-camila.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS clinicas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_clinica TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    cro TEXT,
    endereco TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS relatorios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER REFERENCES clinicas(id) ON DELETE SET NULL,
    nome_clinica TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    paciente TEXT NOT NULL,
    descricao TEXT,
    arquivo_pdf TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
