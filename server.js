const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000; // ✅ Render requires this

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Debug logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Password verification endpoint
app.post('/verify-password', (req, res) => {
    const { password } = req.body;
    console.log('Password verification request received');

    if (password === "dcstudent") {
        console.log('Password verification: SUCCESS');
        res.json({ success: true });
    } else {
        console.log('Password verification: FAILED');
        res.json({ success: false });
    }
});

// Results list endpoint
app.get('/results-list', (req, res) => {
    const resultsDir = path.join(__dirname, 'public', 'results-file');
    console.log('Reading results directory:', resultsDir);

    try {
        const files = fs.readdirSync(resultsDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        console.log(`Found ${jsonFiles.length} JSON files:`, jsonFiles);
        res.json(jsonFiles);
    } catch (error) {
        console.error('Error reading results directory:', error);
        res.status(500).json({ error: 'Unable to read results directory' });
    }
});

// Serve result-view directly
app.get('/result-view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'result-view', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://${process.env.HOST || 'localhost'}:${PORT}`);
    console.log('Debug logging enabled for all key actions');
});