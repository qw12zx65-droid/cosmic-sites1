# Cosmic Sites

Это безопасный шаблон из **двух сайтов**:

1. **Публичная форма** (`frontend/index.html`) — имя + большой текст до 9000 символов + кнопка отправки.
2. **Админ-панель** (`frontend/admin.html`) — просмотр отправленных записей через пароль.

## Важное ограничение

**GitHub Pages не умеет безопасно хранить и обрабатывать отправленные данные сам по себе**, потому что это статический хостинг.
Поэтому здесь используется схема:

- **GitHub Pages** → хостит 2 страницы (`index.html` и `admin.html`)
- **Node.js backend** → принимает и хранит данные, проверяет пароль

## Что уже сделано

- космический стиль
- поле `Имя`
- большое поле текста на 9000 символов
- кнопка отправки
- отдельная админка
- защита доступа к админке через пароль
- `helmet`
- ограничение запросов `express-rate-limit`
- CORS по белому списку доменов
- валидация длины полей
- SQLite для хранения сообщений

## Пароль

Ты просил пароль:

`L@gtJHFo%qa7uAb`

Он **не должен лежать в HTML/JS-коде на GitHub Pages**, иначе его смогут увидеть.
Поэтому он задаётся в `.env` на сервере:

```env
ADMIN_PASSWORD=L@gtJHFo%qa7uAb
```

## Как запустить локально

### 1. Бэкенд

```bash
cd backend
cp .env.example .env
npm install
npm start
```

Сервер запустится на `http://localhost:3000`

### 2. Фронтенд

Открой папку `frontend` любым локальным сервером, например через VS Code Live Server.

Потом в файлах:

- `frontend/app.js`
- `frontend/admin.js`

замени:

```js
https://YOUR-BACKEND-URL.example.com
```

на:

```js
http://localhost:3000
```

## Как выложить на GitHub

### Фронтенд на GitHub Pages

Загрузи содержимое папки `frontend` в репозиторий, например:

- `index.html`
- `admin.html`
- `styles.css`
- `app.js`
- `admin.js`

Включи **GitHub Pages** в настройках репозитория.

### Бэкенд на Render / Railway / VPS

Загрузи папку `backend` как Node.js проект.

Укажи переменные окружения:

```env
PORT=3000
ADMIN_PASSWORD=L@gtJHFo%qa7uAb
ALLOWED_ORIGINS=https://YOUR_USERNAME.github.io
```

После деплоя вставь URL бэкенда в:

- `frontend/app.js`
- `frontend/admin.js`

## Почему я не сделал всё только на GitHub Pages

Потому что тогда:

- пароль можно было бы вытащить из кода
- данные негде безопасно хранить
- не было бы нормальной серверной проверки

## Что можно усилить ещё

- хешировать пароль через bcrypt
- хранить admin-сессию в HttpOnly cookie вместо localStorage
- добавить CAPTCHA
- добавить HTTPS-only cookies
- вынести БД в Postgres/Supabase
- логировать подозрительные попытки входа

