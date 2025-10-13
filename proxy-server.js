// Simple proxy server for GPlates API
// Deploy this to your server to handle CORS issues

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your domain
app.use(cors({
    origin: [
        'http://localhost:8000',
        'https://deeptimewhispers.com',
        'https://www.deeptimewhispers.com',
        // Add any other domains you're hosting from
    ]
}));

// Proxy endpoint for GPlates reconstruct API
app.get('/api/gplates/reconstruct', async (req, res) => {
    try {
        const { points, time, model = 'MULLER2019' } = req.query;
        
        if (!points || !time) {
            return res.status(400).json({ 
                error: 'Missing required parameters: points and time' 
            });
        }
        
        // Call the actual GPlates API
        const gplatesUrl = `https://gws.gplates.org/reconstruct/reconstruct_points/?points=${points}&time=${time}&model=${model}`;
        
        const response = await fetch(gplatesUrl);
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'GPlates API error', 
                details: data 
            });
        }
        
        // Return the reconstructed coordinates
        res.json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Proxy server error', 
            message: error.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'GPlates Proxy' });
});

app.listen(PORT, () => {
    console.log(`GPlates proxy server running on port ${PORT}`);
});