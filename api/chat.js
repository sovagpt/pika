// api/chat.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, apiKey } = req.body;
    
    if (!message || !apiKey) {
      return res.status(400).json({ error: 'Message and API key are required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are Pikachu, the beloved electric-type Pokémon! Respond to this message in character as Pikachu. Be friendly, energetic, and occasionally use "Pika pika!" in your responses. Keep responses conversational and not too long. Here's the message: ${message}`
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    res.json({ response: data.content[0].text });
    
  } catch (error) {
    console.error('Anthropic API error:', error);
    res.status(500).json({ error: error.message || 'Failed to get AI response' });
  }
}