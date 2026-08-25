/* Autenticação (Supabase) — usado por login.html e gerador.html */

const supabaseConfigured =
  typeof SUPABASE_URL === 'string' &&
  typeof SUPABASE_ANON_KEY === 'string' &&
  !SUPABASE_URL.includes('COLE_AQUI') &&
  !SUPABASE_ANON_KEY.includes('COLE_AQUI');

const supabaseClient = supabaseConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/** Redireciona para login.html se não houver sessão ativa. Retorna a sessão (ou null). */
async function requireAuth() {
  if (!supabaseConfigured) {
    document.body.innerHTML =
      '<div style="max-width:520px;margin:80px auto;padding:24px;font-family:sans-serif;color:#c0392b;">' +
      '<h2>Configuração pendente</h2>' +
      '<p>O arquivo <code>supabase-config.js</code> ainda não foi preenchido com os dados do projeto Supabase. ' +
      'Veja o arquivo <code>SETUP-SUPABASE.md</code> para o passo a passo.</p></div>';
    return null;
  }
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

async function logout() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}
