// api/speech.js
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
    const { text, apiKey } = req.body;
    
    if (!text || !apiKey) {
      return res.status(400).json({ error: 'Text and API key are required' });
    }

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`ElevenLabs API error: ${errorData}`);
    }

    // Get the audio data as buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Set proper headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    
    // Send the audio buffer
    res.status(200).send(Buffer.from(audioBuffer));
    
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate speech' });
  }
}