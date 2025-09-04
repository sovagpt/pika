const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins (adjust in production)
app.use(cors());
app.use(express.json());

// Serve static files (your HTML)
app.use(express.static('public'));

// Anthropic API proxy endpoint
app.post('/api/chat', async (req, res) => {
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
});

// ElevenLabs API proxy endpoint
app.post('/api/speech', async (req, res) => {
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

        // Stream the audio response back to the client
        res.setHeader('Content-Type', 'audio/mpeg');
        response.body.pipe(res);
        
    } catch (error) {
        console.error('ElevenLabs API error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate speech' });
    }
});

app.listen(PORT, () => {
    console.log(`Pikachu AI server running on http://localhost:${PORT}`);
    console.log('Make sure to:');
    console.log('1. Put your HTML file in a "public" folder');
    console.log('2. Install dependencies: npm install express cors node-fetch dotenv');
    console.log('3. Open VTube Studio with your Pikachu model');
    console.log('4. Visit http://localhost:3001 to use the chat');
});
