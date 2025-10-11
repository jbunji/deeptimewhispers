// Vercel Serverless Function for GPlates API proxy
// Deploy this with Vercel for free

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    const { points, time, model = 'MULLER2019' } = req.query;
    
    if (!points || !time) {
        return res.status(400).json({ 
            error: 'Missing required parameters: points and time' 
        });
    }
    
    try {
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
        res.status(200).json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Proxy server error', 
            message: error.message 
        });
    }
}