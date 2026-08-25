# Sistema-Camila

Site da Dra. Camila Borges (Endodontista, CRO 13673/DF) com duas partes:

1. **Site de divulgação** (`index.html`) — público, mostra os diferenciais e casos da Dra. Camila.
2. **Gerador de Relatório Endodôntico** (`gerador.html`) — **área restrita**, atrás de login, usada pela Dra. Camila para gerar e enviar relatórios em PDF para as clínicas parceiras.

Front-end estático (HTML/CSS/JS), publicado no **GitHub Pages**. A autenticação e o banco de dados usam o **Supabase** (gratuito).

## Site de divulgação

`index.html` tem seções de Sobre, Diferenciais, Casos e Contato, com conteúdo de exemplo — **edite os textos, fotos e dados de contato** antes de divulgar. Os trechos pensados para substituição estão marcados com comentários `<!-- ... -->` no HTML.

## Área restrita (gerador de relatórios)

- `login.html`: login por e-mail/senha (sem cadastro público — só quem for criado manualmente no Supabase consegue entrar).
- `gerador.html`: formulário do relatório (clínica/responsável, paciente, descrição do caso, imagens), com o mesmo layout do PDF original. Exige login; sem sessão, redireciona para `login.html`.
- Clínicas cadastradas e o histórico de relatórios ficam salvos no banco de dados do Supabase (compartilhado entre dispositivos, protegido por login), em vez de só no navegador.
- O PDF é gerado inteiramente no navegador com [html2pdf.js](https://github.com/eKoopmans/html2pdf.js), com pré-visualização antes de baixar.

### Configuração necessária (uma única vez)

A área restrita só funciona depois de configurar um projeto Supabase (login + banco de dados). Siga o passo a passo em **[SETUP-SUPABASE.md](./SETUP-SUPABASE.md)**. Antes disso, `gerador.html` e `login.html` mostram um aviso de "configuração pendente" em vez de dar erro.

## Publicação no GitHub Pages

Os arquivos ficam na raiz do repositório (sem pasta `public/`) para que o GitHub Pages sirva tudo diretamente.

Em **Settings → Pages → Build and deployment → Source**, selecione **Deploy from a branch**, branch `main`, pasta **`/ (root)`**. A partir daí, cada push em `main` publica automaticamente em `https://<usuario>.github.io/<repositorio>/`.

> Se aparecer 404, confira se o Source em Settings → Pages aponta para `main` / `/ (root)` — apontar para outra branch ou pasta é a causa mais comum.

## Rodar localmente

Não precisa instalar nada — é HTML/CSS/JS puro:

```bash
python3 -m http.server 8080
```

Acesse `http://localhost:8080`. A área restrita (`gerador.html`/`login.html`) só funciona depois de configurar o Supabase (veja acima); sem isso, mostra o aviso de configuração pendente.

## Estrutura

```
index.html              # site de divulgação (público)
login.html / login.js   # login da área restrita
gerador.html            # gerador de relatórios (protegido por login)
auth.js                 # sessão/login/logout (Supabase Auth)
supabase-config.js      # URL e chave do projeto Supabase (preencher — veja SETUP-SUPABASE.md)
supabase-db.js          # clínicas e relatórios (Supabase/Postgres)
report-template.js      # monta o HTML do relatório para exportação em PDF
app.js                  # lógica do gerador (formulário, CRUD de clínicas, geração de PDF)
styles.css              # visual do site + do gerador + template do relatório (layout original)
assets/                  # logo e ícones (recortes fiéis ao modelo original)
SETUP-SUPABASE.md       # passo a passo para configurar login + banco de dados
.nojekyll                # evita que o GitHub Pages processe o site como Jekyll
```

## Layout do relatório preservado

O cabeçalho (logo + navy + faixa dourada) e os ícones de localização/paciente usados no PDF são os mesmos recortes de imagem do modelo original enviado, garantindo fidelidade total de cor e tipografia da marca.
