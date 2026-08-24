/* Banco de dados local (IndexedDB) — funciona 100% no navegador, sem servidor. */

const DB_NAME = 'sistema-camila';
const DB_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const idb = e.target.result;
      if (!idb.objectStoreNames.contains('clinicas')) {
        idb.createObjectStore('clinicas', { keyPath: 'id', autoIncrement: true });
      }
      if (!idb.objectStoreNames.contains('relatorios')) {
        idb.createObjectStore('relatorios', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const dbPromise = openDatabase();

function requestToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getStore(name, mode) {
  const idb = await dbPromise;
  return idb.transaction(name, mode).objectStore(name);
}

const DB = {
  async getAllClinicas() {
    const store = await getStore('clinicas', 'readonly');
    const all = await requestToPromise(store.getAll());
    return all.sort((a, b) => a.nome_clinica.localeCompare(b.nome_clinica, 'pt-BR'));
  },

  async addClinica(data) {
    const store = await getStore('clinicas', 'readwrite');
    const id = await requestToPromise(store.add({ ...data, criado_em: new Date().toISOString() }));
    return { ...data, id };
  },

  async updateClinica(id, data) {
    const store = await getStore('clinicas', 'readwrite');
    const numId = Number(id);
    await requestToPromise(store.put({ ...data, id: numId }));
    return { ...data, id: numId };
  },

  async deleteClinica(id) {
    const store = await getStore('clinicas', 'readwrite');
    await requestToPromise(store.delete(Number(id)));
  },

  async getAllRelatorios() {
    const store = await getStore('relatorios', 'readonly');
    const all = await requestToPromise(store.getAll());
    return all.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
  },

  async addRelatorio(data) {
    const store = await getStore('relatorios', 'readwrite');
    const id = await requestToPromise(store.add({ ...data, criado_em: new Date().toISOString() }));
    return { ...data, id };
  },

  async deleteRelatorio(id) {
    const store = await getStore('relatorios', 'readwrite');
    await requestToPromise(store.delete(Number(id)));
  },
};
