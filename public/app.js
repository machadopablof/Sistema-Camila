const state = {
  clinics: [],
  selectedImages: [], // File[]
};

// ---------- Helpers ----------

async function api(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = 'Erro na requisição';
    try {
      const data = await res.json();
      message = data.error || message;
    } catch (_) {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

function fmtDate(iso) {
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString('pt-BR');
}

// ---------- Clínicas ----------

async function loadClinics() {
  state.clinics = await api('/api/clinicas');
  renderClinicSelect();
  renderClinicTable();
}

function renderClinicSelect() {
  const select = document.getElementById('clinic-select');
  select.innerHTML = '<option value="">— Selecionar clínica salva —</option>';
  state.clinics.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.nome_clinica} — ${c.responsavel}`;
    select.appendChild(opt);
  });
}

function renderClinicTable() {
  const tbody = document.getElementById('clinic-table-body');
  tbody.innerHTML = '';
  if (state.clinics.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-hint">Nenhuma clínica cadastrada.</td></tr>';
    return;
  }
  state.clinics.forEach((c) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(c.nome_clinica)}</td>
      <td>${escapeHtml(c.responsavel)}</td>
      <td>${escapeHtml(c.cro || '-')}</td>
      <td class="row-actions">
        <button type="button" data-edit="${c.id}">Editar</button>
        <button type="button" class="del" data-del="${c.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => startEditClinic(btn.dataset.edit));
  });
  tbody.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', () => deleteClinic(btn.dataset.del));
  });
}

function escapeHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function startEditClinic(id) {
  const c = state.clinics.find((x) => String(x.id) === String(id));
  if (!c) return;
  document.getElementById('clinic-id').value = c.id;
  document.getElementById('cf-nome_clinica').value = c.nome_clinica;
  document.getElementById('cf-responsavel').value = c.responsavel;
  document.getElementById('cf-cro').value = c.cro || '';
  document.getElementById('cf-endereco').value = c.endereco || '';
  document.getElementById('clinic-form-title').textContent = 'Editar clínica';
  document.getElementById('btn-clinic-cancel-edit').hidden = false;
}

function resetClinicForm() {
  document.getElementById('clinic-form').reset();
  document.getElementById('clinic-id').value = '';
  document.getElementById('clinic-form-title').textContent = 'Nova clínica';
  document.getElementById('btn-clinic-cancel-edit').hidden = true;
}

async function deleteClinic(id) {
  if (!confirm('Excluir esta clínica?')) return;
  await api(`/api/clinicas/${id}`, { method: 'DELETE' });
  await loadClinics();
}

document.getElementById('clinic-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('clinic-id').value;
  const payload = {
    nome_clinica: document.getElementById('cf-nome_clinica').value.trim(),
    responsavel: document.getElementById('cf-responsavel').value.trim(),
    cro: document.getElementById('cf-cro').value.trim(),
    endereco: document.getElementById('cf-endereco').value.trim(),
  };
  if (id) {
    await api(`/api/clinicas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else {
    await api('/api/clinicas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
  resetClinicForm();
  await loadClinics();
});

document.getElementById('btn-clinic-cancel-edit').addEventListener('click', resetClinicForm);

document.getElementById('clinic-select').addEventListener('change', (e) => {
  const c = state.clinics.find((x) => String(x.id) === e.target.value);
  if (c) {
    document.getElementById('nome_clinica').value = c.nome_clinica;
    document.getElementById('responsavel').value = c.responsavel;
  }
});

document.getElementById('btn-manage-clinics').addEventListener('click', () => {
  document.getElementById('clinic-modal').hidden = false;
});
document.getElementById('btn-close-modal').addEventListener('click', () => {
  document.getElementById('clinic-modal').hidden = true;
  resetClinicForm();
});
document.getElementById('clinic-modal').addEventListener('click', (e) => {
  if (e.target.id === 'clinic-modal') {
    document.getElementById('clinic-modal').hidden = true;
    resetClinicForm();
  }
});

// ---------- Imagens ----------

document.getElementById('imagens').addEventListener('change', (e) => {
  state.selectedImages = Array.from(e.target.files);
  renderImagePreview();
});

function renderImagePreview() {
  const wrap = document.getElementById('image-preview');
  wrap.innerHTML = '';
  state.selectedImages.forEach((file, idx) => {
    const div = document.createElement('div');
    div.className = 'thumb';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'remove';
    btn.textContent = '×';
    btn.addEventListener('click', () => {
      state.selectedImages.splice(idx, 1);
      renderImagePreview();
    });
    div.appendChild(img);
    div.appendChild(btn);
    wrap.appendChild(div);
  });
}

// ---------- Relatórios ----------

async function loadReports() {
  const reports = await api('/api/relatorios');
  const list = document.getElementById('reports-list');
  if (reports.length === 0) {
    list.innerHTML = '<p class="empty-hint">Nenhum relatório gerado ainda.</p>';
    return;
  }
  list.innerHTML = '';
  reports.forEach((r) => {
    const div = document.createElement('div');
    div.className = 'report-row';
    div.innerHTML = `
      <div>
        <strong>${escapeHtml(r.paciente)}</strong> — ${escapeHtml(r.nome_clinica)}
        <div class="meta">${fmtDate(r.criado_em)}</div>
      </div>
      <a href="/reports-files/${r.arquivo_pdf}" target="_blank" rel="noopener">Baixar PDF</a>
    `;
    list.appendChild(div);
  });
}

document.getElementById('report-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById('form-error');
  errorBox.hidden = true;
  const btn = document.getElementById('btn-generate');
  btn.disabled = true;
  btn.textContent = 'Gerando PDF...';

  try {
    const formData = new FormData();
    const clinicSelect = document.getElementById('clinic-select');
    if (clinicSelect.value) formData.append('clinica_id', clinicSelect.value);
    formData.append('nome_clinica', document.getElementById('nome_clinica').value.trim());
    formData.append('responsavel', document.getElementById('responsavel').value.trim());
    formData.append('paciente', document.getElementById('paciente').value.trim());
    formData.append('descricao', document.getElementById('descricao').value);
    state.selectedImages.forEach((file) => formData.append('imagens', file));

    const result = await api('/api/relatorios/gerar', { method: 'POST', body: formData });
    window.open(result.url, '_blank');
    await loadReports();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Gerar PDF';
  }
});

// ---------- Init ----------

loadClinics();
loadReports();
