const API_BASE = 'https://cosmic-sites1.onrender.com/';

const form = document.getElementById('messageForm');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const counter = document.getElementById('counter');
const statusEl = document.getElementById('status');
const submitBtn = document.getElementById('submitBtn');

function updateCounter() {
  counter.textContent = `${messageInput.value.length} / 9000`;
}

messageInput.addEventListener('input', updateCounter);
updateCounter();

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) {
    statusEl.textContent = 'Заполните имя и текст.';
    return;
  }

  if (message.length > 9000) {
    statusEl.textContent = 'Текст превышает 9000 символов.';
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = 'Отправка...';

  try {
    const response = await fetch(`${API_BASE}/api/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка отправки.');
    }

    form.reset();
    updateCounter();
    statusEl.textContent = 'Сообщение успешно отправлено.';
  } catch (error) {
    statusEl.textContent = error.message || 'Не удалось отправить сообщение.';
  } finally {
    submitBtn.disabled = false;
  }
});
