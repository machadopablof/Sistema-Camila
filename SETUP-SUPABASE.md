# Configurar o login e o banco de dados (Supabase)

O gerador de relatórios (`gerador.html`) fica atrás de login e salva os dados
(clínicas e histórico de relatórios) num banco de dados na nuvem, usando o
[Supabase](https://supabase.com) — um serviço com plano gratuito que fornece
autenticação e um banco Postgres. Site público e de divulgação continuam sem
precisar de nada disso.

Siga os passos abaixo **uma única vez**.

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta grátis (dá para entrar com GitHub).
2. Clique em **New project**.
3. Escolha um nome (ex: `sistema-camila`), uma senha para o banco (guarde essa senha) e a região mais próxima (ex: South America).
4. Aguarde alguns minutos até o projeto ficar pronto.

## 2. Criar as tabelas (clínicas e relatórios)

1. No painel do projeto, abra **SQL Editor** (menu lateral) → **New query**.
2. Cole o script abaixo e clique em **Run**.

```sql
create table if not exists clinicas (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome_clinica text not null,
  responsavel text not null,
  cro text,
  endereco text,
  criado_em timestamptz not null default now()
);

create table if not exists relatorios (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome_clinica text not null,
  responsavel text not null,
  paciente text not null,
  descricao text,
  imagens jsonb,
  criado_em timestamptz not null default now()
);

alter table clinicas enable row level security;
alter table relatorios enable row level security;

create policy "select own clinicas" on clinicas for select using (auth.uid() = user_id);
create policy "insert own clinicas" on clinicas for insert with check (auth.uid() = user_id);
create policy "update own clinicas" on clinicas for update using (auth.uid() = user_id);
create policy "delete own clinicas" on clinicas for delete using (auth.uid() = user_id);

create policy "select own relatorios" on relatorios for select using (auth.uid() = user_id);
create policy "insert own relatorios" on relatorios for insert with check (auth.uid() = user_id);
create policy "update own relatorios" on relatorios for update using (auth.uid() = user_id);
create policy "delete own relatorios" on relatorios for delete using (auth.uid() = user_id);
```

Isso cria as duas tabelas e ativa **Row Level Security (RLS)**: cada usuário só
enxerga e altera os próprios dados — importante mesmo havendo só um usuário
hoje, e essencial se no futuro mais de uma pessoa usar o sistema.

## 3. Criar o usuário (login da Dra. Camila)

Não existe cadastro público no site — só quem você criar manualmente consegue
entrar.

1. No painel do Supabase, vá em **Authentication → Users → Add user**.
2. Preencha e-mail e senha, e marque **Auto Confirm User** (para não precisar de e-mail de confirmação).
3. Clique em **Create user**.

Esse será o e-mail/senha usados para logar em `login.html`.

## 4. Pegar a URL e a chave do projeto

1. Vá em **Project Settings → API**.
2. Copie o **Project URL**.
3. Copie a chave **anon public** (não é a `service_role`, que é secreta — use a `anon public`, que é segura para o front-end).

## 5. Preencher o `supabase-config.js`

Abra o arquivo `supabase-config.js` no repositório e substitua:

```js
const SUPABASE_URL = 'COLE_AQUI_A_PROJECT_URL';
const SUPABASE_ANON_KEY = 'COLE_AQUI_A_ANON_PUBLIC_KEY';
```

pelos valores copiados no passo 4. Salve, faça commit e push — o GitHub Pages
publica automaticamente.

## Pronto

Depois disso, `login.html` autentica com o usuário criado no passo 3, e
`gerador.html` passa a exigir login e salvar clínicas/relatórios no Supabase
em vez do navegador.

> Nota sobre imagens: as imagens anexadas nos relatórios ficam salvas como
> texto (base64) dentro da tabela `relatorios`. Para poucas imagens por
> relatório isso funciona bem dentro do plano gratuito do Supabase. Se o
> volume de imagens crescer muito, o próximo passo seria usar o **Supabase
> Storage** (armazenamento de arquivos) em vez de guardar as imagens na
> própria tabela — posso implementar isso depois, se precisar.
