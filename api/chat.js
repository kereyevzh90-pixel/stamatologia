const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, faq, systemPrompt } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const DEFAULT_SYSTEM = `Ты Дента — дружелюбный ИИ-ассистент стоматологической клиники СтомаКлиник (Москва).

Информация о клинике:
- Адрес: ул. Стоматологическая, д. 1, Москва. Метро 5 минут, парковка бесплатно.
- Телефон: 8 800 123-45-67
- Режим работы: Пн–Пт 9:00–20:00, Сб 10:00–18:00, Вс — выходной
- Первичная консультация — бесплатно

Услуги и цены:
- Кариес — от 2 500 ₽
- Удаление зуба — от 1 500 ₽
- Отбеливание ZOOM 4 — от 8 000 ₽ (светлее на 6–10 тонов за 1 час)
- Брекеты металлические — от 45 000 ₽
- Брекеты сапфировые — от 65 000 ₽
- Элайнеры Invisalign — от 120 000 ₽
- Имплантация (Nobel, Straumann) — от 35 000 ₽ под ключ, гарантия 5 лет
- Виниры — от 12 000 ₽/шт
- Коронки циркониевые — от 15 000 ₽
- Детская стоматология — с 3 лет, первый визит бесплатно
- Рассрочка 0% до 12 месяцев

Правила общения:
- Отвечай кратко, дружелюбно, по делу
- Используй эмодзи умеренно
- Если спрашивают о симптомах — посочувствуй и предложи записаться
- Никогда не ставь диагнозы
- Если не знаешь ответа — скажи что лучше уточнить по телефону 8 800 123-45-67
- Отвечай только на русском языке`;

  let SYSTEM = (systemPrompt && systemPrompt.trim()) ? systemPrompt.trim() : DEFAULT_SYSTEM;

  if (Array.isArray(faq) && faq.length > 0) {
    const faqBlock = faq
      .filter(item => item.q && item.a)
      .map(item => `Вопрос: ${item.q}\nОтвет: ${item.a}`)
      .join('\n---\n');
    if (faqBlock) {
      SYSTEM += `\n\n[Приоритетные ответы — используй их точно, когда вопрос совпадает]\n${faqBlock}`;
    }
  }

  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: messages,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 400,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    ]
  });

  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const request = https.request(options, (response) => {
        let raw = '';
        response.on('data', chunk => { raw += chunk; });
        response.on('end', () => {
          try {
            resolve({ status: response.statusCode, body: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: response.statusCode, body: { error: { message: raw } } });
          }
        });
      });

      request.on('error', reject);
      request.write(payload);
      request.end();
    });

    if (result.status !== 200) {
      const errMsg = result.body.error?.message || JSON.stringify(result.body);
      return res.status(200).json({ text: 'ОШИБКА GEMINI: ' + errMsg });
    }

    const text = result.body.candidates?.[0]?.content?.parts?.[0]?.text
      || 'ОШИБКА: нет candidates. Ответ: ' + JSON.stringify(result.body).slice(0, 200);
    res.json({ text });

  } catch (err) {
    res.status(200).json({ text: 'ОШИБКА СЕТИ: ' + err.message });
  }
};
