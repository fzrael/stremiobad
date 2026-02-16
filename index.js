const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, cors);
        res.end();
        return;
    }
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...cors });
        res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'));
    } else {
        res.writeHead(404, cors);
        res.end('Not Found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  Stremio CORS Scanner`);
    console.log(`  http://localhost:${PORT}\n`);
});
