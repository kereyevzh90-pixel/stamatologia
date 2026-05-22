export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const SYSTEM = `Ты Дента — дружелюбный ИИ-ассистент стоматологической клиники СтомаКлиник (Москва).

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

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', data);
      return res.status(500).json({ error: 'AI error', detail: data.error?.message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Извините, попробуйте повторить вопрос.';
    res.json({ text });

  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
