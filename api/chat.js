export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Ты — умный и дружелюбный ассистент стоматологической клиники "СтомаКлиник".
Отвечай на вопросы о стоматологии подробно и понятно, но также можешь отвечать на любые другие вопросы.
Общайся на русском языке. Будь вежлив и лаконичен.
Если спрашивают о записи — предложи позвонить по номеру 8 800 123-45-67.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return res.status(500).json({ error: 'No response from AI' });

    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}
