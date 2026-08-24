/* Banco de dados (Supabase/Postgres) — clínicas e relatórios ficam na nuvem,
   compartilhados entre dispositivos, protegidos por login (Row Level Security). */

async function currentUserId() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
  return user.id;
}

const DB = {
  async getAllClinicas() {
    const { data, error } = await supabaseClient
      .from('clinicas')
      .select('*')
      .order('nome_clinica', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addClinica(payload) {
    const user_id = await currentUserId();
    const { data, error } = await supabaseClient
      .from('clinicas')
      .insert({ ...payload, user_id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateClinica(id, payload) {
    const { data, error } = await supabaseClient
      .from('clinicas')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteClinica(id) {
    const { error } = await supabaseClient.from('clinicas').delete().eq('id', id);
    if (error) throw error;
  },

  async getAllRelatorios() {
    const { data, error } = await supabaseClient
      .from('relatorios')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addRelatorio(payload) {
    const user_id = await currentUserId();
    const { data, error } = await supabaseClient
      .from('relatorios')
      .insert({ ...payload, user_id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteRelatorio(id) {
    const { error } = await supabaseClient.from('relatorios').delete().eq('id', id);
    if (error) throw error;
  },
};
