# Sistema-Camila

Sistema de atendimento de pacientes Dra. Camila Borges — geração automatizada do **Relatório Endodôntico** em PDF, mantendo exatamente o layout, as cores e a logo do modelo original.

## O que o sistema faz

- Formulário web para preencher os dados do relatório.
- **Clínica / Dr(a). responsável**: campo preenchido a partir de um cadastro salvo (botão "Gerenciar clínicas"), com CRUD completo (criar, editar, excluir).
- **Paciente**: campo de nome do paciente.
- **Descrição do caso**: caixa de texto livre.
- **Imagens**: upload de uma ou mais imagens (radiografias, fotos clínicas etc.) que são inseridas no PDF.
- Ao clicar em "Gerar PDF", o sistema monta o relatório no layout original (cabeçalho navy com a logo, faixa dourada, bloco de destaque, ícones laranja de localização/paciente, divisórias) e disponibiliza o PDF para download.
- Histórico de relatórios gerados, com link para baixar novamente.

## Banco de dados

Os dados de **clínicas/responsáveis** e o **histórico de relatórios** são salvos em um banco **SQLite local** (`data/sistema-camila.db`), criado automaticamente na primeira execução — gratuito, sem necessidade de conta ou credenciais externas. Os PDFs gerados ficam em `data/reports/`.

> Alternativa futura: se preferir manter os dados em uma planilha do Google Drive em vez do SQLite local, é possível trocar a camada de dados (`db.js`) por integração com a Google Sheets API — isso exigirá configurar credenciais OAuth de uma conta Google (Client ID/Secret) que hoje o projeto não possui.

## Como rodar

```bash
npm install
npm start
```

Acesse `http://localhost:3000`.

## Estrutura

```
server.js                    # servidor Express + rotas de API
db.js                        # SQLite (clínicas e relatórios)
templates/report-template.js # template HTML do PDF (layout fiel ao original)
public/                      # formulário (HTML/CSS/JS) e assets do layout (logo, ícones)
data/                        # banco de dados, uploads e PDFs gerados (não versionado)
```

## Layout preservado

O cabeçalho (logo + navy + faixa dourada) e os ícones de localização/paciente usados no PDF são os mesmos recortes de imagem do modelo original enviado, garantindo fidelidade total de cor e tipografia da marca.
