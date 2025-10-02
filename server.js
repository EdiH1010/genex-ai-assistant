require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Endpoint for Firebase configuration
app.get('/firebase-config', (req, res) => {
    res.json({
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID
    });
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Endpoint for AI responses
app.post('/get-ai-response', async (req, res) => {
  if (!GEMINI_API_KEY) { return res.status(500).json({ error: 'API key not set on the server.' }); }
  try {
    const { prompt, history, location } = req.body;
    let augmentedPrompt = `The current date and time is ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })} (IST). The user's question is: "${prompt}"`;
    if (location) { augmentedPrompt += ` The user is approximately at latitude ${location.latitude} and longitude ${location.longitude}.`; }
    const systemInstruction = { role: "system", parts: [{ text: `You are Genex, a helpful AI assistant. If the user asks to open a website, you MUST respond with ONLY a JSON object in this exact format: {"action": "open_url", "url": "https://www.thedomain.com"}.` }] };
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;
    const apiResponse = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [...(history || []), { role: 'user', parts: [{ text: augmentedPrompt }] }], systemInstruction }) });
    if (!apiResponse.ok) { const errorData = await apiResponse.json(); return res.status(apiResponse.status).json(errorData); }
    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error) { res.status(500).json({ error: 'Internal Server Error' }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. Open http://localhost:5000 in your browser.`);
});