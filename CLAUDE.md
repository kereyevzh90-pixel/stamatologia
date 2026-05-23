# Правила проекта

## Автодеплой

После **каждого изменения** файлов (`index.html`, `style.css` или любых других) — сразу загружай изменения на GitHub через браузер (или терминал если доступен) и сообщи пользователю что сайт обновлён.

Репозиторий: https://github.com/kereyevzh90-pixel/stamatologia
Vercel: автоматически деплоит при каждом пуше в `main`.

## Стек
- Чистый HTML + CSS (без фреймворков)
- Шрифт: Inter (Google Fonts)
- Цветовая схема: синий (#2563EB) + белый

## Структура
- `index.html` — главная страница
- `assistant.html` — страница ИИ-ассистента Дента
- `style.css` — стили (единый файл)
- `api/chat.js` — Vercel serverless функция, подключает Gemini AI
- `images/` — фотографии
  - `IMG_0967.PNG` — десктоп hero (горизонтальное фото)
  - `IMG_0982.PNG` — мобильный hero (вертикальное/портретное фото)

## ИИ-ассистент
- Страница: `/assistant.html`
- Модель: `gemini-2.0-flash` (через Google Gemini API)
- API ключ: переменная `GEMINI_API_KEY` в настройках Vercel
- Vercel функция: `api/chat.js` (CommonJS, без package.json, без vercel.json)
- **Важно:** НЕ добавлять `package.json` и НЕ добавлять `vercel.json` с полем `runtime` — это ломает деплой

## Кодовые слова
- **бобо** — значит «обнови»: сделай git add + commit + push на GitHub
