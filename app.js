const state = {
  clinics: [],
  selectedImages: [], // [{ name, dataUri }]
};

// ---------- Helpers ----------

function escapeHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString('pt-BR');
}

function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function slugify(str = '') {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase() || 'relatorio';
}

// ---------- Clínicas ----------

async function loadClinics() {
  state.clinics = await DB.getAllClinicas();
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
  await DB.deleteClinica(id);
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
    await DB.updateClinica(id, payload);
  } else {
    await DB.addClinica(payload);
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

document.getElementById('imagens').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  state.selectedImages = await Promise.all(
    files.map(async (file) => ({ name: file.name, dataUri: await fileToDataUri(file) }))
  );
  renderImagePreview();
});

function renderImagePreview() {
  const wrap = document.getElementById('image-preview');
  wrap.innerHTML = '';
  state.selectedImages.forEach((img, idx) => {
    const div = document.createElement('div');
    div.className = 'thumb';
    const imgEl = document.createElement('img');
    imgEl.src = img.dataUri;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'remove';
    btn.textContent = '×';
    btn.addEventListener('click', () => {
      state.selectedImages.splice(idx, 1);
      renderImagePreview();
    });
    div.appendChild(imgEl);
    div.appendChild(btn);
    wrap.appendChild(div);
  });
}

// ---------- Geração de PDF (100% no navegador) ----------

function waitImagesLoaded(root) {
  const imgs = Array.from(root.querySelectorAll('img'));
  return Promise.all(
    imgs.map((img) =>
      img.complete ? Promise.resolve() : new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      })
    )
  );
}

async function gerarPdf(data) {
  const container = document.getElementById('pdf-render-root');
  container.innerHTML = renderReportHtml(data);
  await waitImagesLoaded(container);

  const filename = `relatorio-${slugify(data.paciente)}-${Date.now()}.pdf`;

  await html2pdf()
    .set({
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    })
    .from(container.firstElementChild)
    .save();

  container.innerHTML = '';
}

// ---------- Relatórios (histórico local) ----------

async function loadReports() {
  const reports = await DB.getAllRelatorios();
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
      <div class="actions">
        <button type="button" class="link-btn" data-download="${r.id}">Baixar novamente</button>
        <button type="button" class="link-btn del" data-del-report="${r.id}">Excluir</button>
      </div>
    `;
    list.appendChild(div);
  });

  list.querySelectorAll('[data-download]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const r = reports.find((x) => String(x.id) === btn.dataset.download);
      if (!r) return;
      btn.disabled = true;
      btn.textContent = 'Gerando...';
      try {
        await gerarPdf({
          nomeClinica: r.nome_clinica,
          responsavel: r.responsavel,
          paciente: r.paciente,
          descricao: r.descricao,
          imagens: r.imagens,
        });
      } finally {
        btn.disabled = false;
        btn.textContent = 'Baixar novamente';
      }
    });
  });

  list.querySelectorAll('[data-del-report]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Excluir este relatório do histórico?')) return;
      await DB.deleteRelatorio(btn.dataset.delReport);
      await loadReports();
    });
  });
}

document.getElementById('report-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById('form-error');
  errorBox.hidden = true;
  const btn = document.getElementById('btn-generate');

  const nomeClinica = document.getElementById('nome_clinica').value.trim();
  const responsavel = document.getElementById('responsavel').value.trim();
  const paciente = document.getElementById('paciente').value.trim();
  const descricao = document.getElementById('descricao').value;

  if (!nomeClinica || !responsavel || !paciente) {
    errorBox.textContent = 'Preencha ao menos a clínica, o(a) responsável e o paciente.';
    errorBox.hidden = false;
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Gerando PDF...';

  try {
    const data = { nomeClinica, responsavel, paciente, descricao, imagens: state.selectedImages };
    await gerarPdf(data);
    await DB.addRelatorio({
      nome_clinica: nomeClinica,
      responsavel,
      paciente,
      descricao,
      imagens: state.selectedImages,
    });
    await loadReports();
  } catch (err) {
    console.error(err);
    errorBox.textContent = 'Falha ao gerar o PDF: ' + err.message;
    errorBox.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Gerar PDF';
  }
});

// ---------- Init ----------

loadClinics();
loadReports();
