const API_BASE = 'https://cosmic-sites1.onrender.com/';
const STORAGE_KEY = 'cosmic_admin_password';

const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const adminStatus = document.getElementById('adminStatus');
const entriesEl = document.getElementById('entries');
const toolbar = document.getElementById('toolbar');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderEntries(items) {
  if (!Array.isArray(items) || items.length === 0) {
    entriesEl.innerHTML = '<div class="entry"><h3>Пока пусто</h3><p class="entry-meta">Сообщений ещё нет.</p></div>';
    return;
  }

  entriesEl.innerHTML = items.map((item) => `
    <article class="entry">
      <h3>${escapeHtml(item.name)}</h3>
      <p class="entry-meta">ID: ${escapeHtml(String(item.id))} · ${escapeHtml(new Date(item.created_at).toLocaleString('ru-RU'))}</p>
      <pre>${escapeHtml(item.message)}</pre>
    </article>
  `).join('');
}

async function fetchEntries(password) {
  adminStatus.textContent = 'Загрузка...';

  const response = await fetch(`${API_BASE}/api/submissions`, {
    headers: {
      'Authorization': `Bearer ${password}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка доступа.');
  }

  renderEntries(data.items || []);
  adminStatus.textContent = `Загружено: ${data.items?.length || 0}`;
  toolbar.classList.remove('hidden');
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = passwordInput.value;
  if (!password) return;

  try {
    await fetchEntries(password);
    localStorage.setItem(STORAGE_KEY, password);
    passwordInput.value = '';
  } catch (error) {
    adminStatus.textContent = error.message || 'Неверный пароль или ошибка сервера.';
  }
});

refreshBtn.addEventListener('click', async () => {
  const password = localStorage.getItem(STORAGE_KEY);
  if (!password) return;
  try {
    await fetchEntries(password);
  } catch (error) {
    adminStatus.textContent = error.message || 'Не удалось обновить данные.';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  toolbar.classList.add('hidden');
  entriesEl.innerHTML = '';
  adminStatus.textContent = 'Вы вышли из панели.';
});

(async () => {
  const savedPassword = localStorage.getItem(STORAGE_KEY);
  if (!savedPassword) return;
  try {
    await fetchEntries(savedPassword);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
})();
