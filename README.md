# Sistema-Camila

Sistema de atendimento de pacientes Dra. Camila Borges — geração automatizada do **Relatório Endodôntico** em PDF, mantendo exatamente o layout, as cores e a logo do modelo original.

É um site **100% estático** (HTML, CSS e JavaScript puro, sem servidor/back-end), publicado no **GitHub Pages**. Tudo roda no navegador do usuário. Os arquivos do site ficam na **raiz do repositório** (`index.html`, `styles.css`, `app.js` etc.) para que o GitHub Pages consiga servi-los diretamente.

## O que o sistema faz

- Formulário web para preencher os dados do relatório.
- **Clínica / Dr(a). responsável**: campo preenchido a partir de um cadastro salvo (botão "Gerenciar clínicas"), com CRUD completo (criar, editar, excluir).
- **Paciente**: campo de nome do paciente.
- **Descrição do caso**: caixa de texto livre.
- **Imagens**: upload de uma ou mais imagens (radiografias, fotos clínicas etc.) que são inseridas no PDF.
- Ao clicar em "Gerar PDF", o sistema monta o relatório no layout original (cabeçalho navy com a logo, faixa dourada, bloco de destaque, ícones laranja de localização/paciente, divisórias) inteiramente no navegador e baixa o PDF pronto.
- Histórico de relatórios gerados (salvo no próprio navegador), com opção de baixar novamente ou excluir.

## Banco de dados

Como o site é estático (GitHub Pages não executa servidor/back-end), os dados de **clínicas/responsáveis** e o **histórico de relatórios** são salvos localmente no navegador via **IndexedDB** — gratuito, nativo do navegador, sem necessidade de conta, servidor ou credenciais externas. Os dados ficam disponíveis entre sessões no mesmo navegador/dispositivo, mas não são sincronizados entre dispositivos diferentes.

> Alternativa futura: para sincronizar os dados entre dispositivos (ex: planilha do Google Drive ou um banco de dados na nuvem), seria necessário adicionar uma integração com uma API externa (ex: Google Sheets API) — isso exige configurar credenciais OAuth de uma conta Google que hoje o projeto não possui, e deixaria de ser um site 100% estático.

## Geração do PDF

O PDF é gerado no navegador com [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) (via CDN), que renderiza o mesmo HTML/CSS do layout original e o converte em PDF — garantindo fidelidade total ao modelo.

## Publicação no GitHub Pages

Como o site é só HTML/CSS/JS na raiz do repositório, não é necessário nenhum passo de build — o GitHub Pages pode servir os arquivos diretamente da branch.

Configuração necessária (feita uma única vez, pela interface do GitHub, em **Settings → Pages**):

1. Em **Build and deployment → Source**, selecione **Deploy from a branch**.
2. Em **Branch**, selecione `main` e a pasta **`/ (root)`**, depois clique em **Save**.

Depois disso, a cada push em `main` o GitHub publica automaticamente a versão mais recente em `https://<usuario>.github.io/<repositorio>/`.

> Se a página mostrar **404**, o motivo mais comum é o Source estar configurado para uma branch/pasta que não contém o `index.html` (por exemplo, apontando para uma branch de outra feature, ou para uma pasta diferente de `/ root`). Confira em Settings → Pages se o Source aponta para `main` / `/ (root)`.

## Rodar localmente

Não é necessário instalar nada — é HTML/CSS/JS puro. Basta servir a raiz do projeto com qualquer servidor estático, por exemplo:

```bash
python3 -m http.server 8080
```

Acesse `http://localhost:8080`.

## Estrutura

```
index.html            # formulário e histórico
styles.css             # visual do app + template do relatório (layout original)
db.js                  # banco de dados local (IndexedDB) — clínicas e relatórios
report-template.js     # monta o HTML do relatório para exportação em PDF
app.js                 # lógica do formulário, CRUD de clínicas e geração de PDF
assets/                 # logo e ícones (recortes fiéis ao modelo original)
.nojekyll              # evita que o GitHub Pages processe o site como Jekyll
```

## Layout preservado

O cabeçalho (logo + navy + faixa dourada) e os ícones de localização/paciente usados no PDF são os mesmos recortes de imagem do modelo original enviado, garantindo fidelidade total de cor e tipografia da marca.
