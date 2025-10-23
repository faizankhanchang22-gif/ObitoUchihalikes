// server.js
const express = require('express');
const fetch = require('node-fetch'); // using node-fetch v2 for wide compatibility
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Basic homepage route (serves public/index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route to call the external like API
app.post('/api/like', async (req, res) => {
  try {
    const { uid, server_name } = req.body;

    // Basic validation
    if (!uid || !server_name) {
      return res.status(400).json({ ok: false, error: 'uid and server_name are required.' });
    }

    // sanitize simple: only digits and limited server_name choices
    const uidSan = String(uid).replace(/\D/g, '');
    const allowedServers = ['ind','pak','us','eu','asia','global']; // example
    if (!allowedServers.includes(server_name)) {
      return res.status(400).json({ ok: false, error: 'server_name not allowed.' });
    }

    // build URL (use provided base)
    const base = 'http://69.62.118.156:19126/like';
    const url = `${base}?uid=${encodeURIComponent(uidSan)}&server_name=${encodeURIComponent(server_name)}&key=freeapi`;

    // call the API
    const response = await fetch(url, { method: 'GET', timeout: 15000 });
    const text = await response.text().catch(() => null);

    // attempt parse JSON if possible
    let data = null;
    try { data = JSON.parse(text); } catch (e) { data = text; }

    // return to frontend
    return res.json({
      ok: true,
      url_called: url,
      status: response.status,
      result: data
    });

  } catch (err) {
    console.error('Error calling like API:', err);
    return res.status(500).json({ ok: false, error: 'Server error calling like API', details: err.message });
  }
});

// Simple health route
app.get('/healthz', (req, res) => res.send('OK'));

// start server
app.listen(PORT, () => {
  console.log(`OBITO UCHIHA app running on port ${PORT}`);
});