/*
 * Configuração do Supabase (autenticação + banco de dados).
 *
 * Como preencher:
 * 1. Crie um projeto grátis em https://supabase.com
 * 2. No painel do projeto, vá em Project Settings → API.
 * 3. Copie o "Project URL" e cole em SUPABASE_URL abaixo.
 * 4. Copie a chave "anon public" e cole em SUPABASE_ANON_KEY abaixo.
 *
 * A "anon public" key é segura para ficar no código do site (front-end) —
 * ela só permite o que as políticas de Row Level Security (RLS) do banco
 * autorizarem. Veja o arquivo SETUP-SUPABASE.md para o passo a passo
 * completo, incluindo o script SQL que cria as tabelas e as políticas.
 */

const SUPABASE_URL = 'COLE_AQUI_A_PROJECT_URL';
const SUPABASE_ANON_KEY = 'COLE_AQUI_A_ANON_PUBLIC_KEY';
