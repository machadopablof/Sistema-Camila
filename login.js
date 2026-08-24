(async () => {
  if (!supabaseConfigured) {
    document.getElementById('login-error').textContent =
      'Configuração pendente: preencha supabase-config.js (veja SETUP-SUPABASE.md).';
    document.getElementById('login-error').hidden = false;
    document.getElementById('btn-login').disabled = true;
    return;
  }

  // Se já estiver logado, vai direto para o gerador.
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    window.location.href = 'gerador.html';
  }
})();

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById('login-error');
  errorBox.hidden = true;

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('btn-login');

  btn.disabled = true;
  btn.textContent = 'Entrando...';

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    errorBox.textContent = 'E-mail ou senha inválidos.';
    errorBox.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Entrar';
    return;
  }

  window.location.href = 'gerador.html';
});
