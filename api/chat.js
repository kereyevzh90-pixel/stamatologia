export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `Ты — дружелюбный ассистент стоматологической клиники "СтомаКлиник".
Отвечай на русском языке, кратко и по делу.
Если спрашивают о записи — предложи позвонить: 8 800 123-45-67.
Можешь отвечать на любые вопросы, не только стоматологические.`
            }]
          },
          contents: [{ parts: [{ text: message }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
        }),
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return res.status(500).json({ error: 'No response' });

    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}
