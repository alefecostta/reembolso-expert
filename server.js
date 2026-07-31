const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DB_PATH = path.join(__dirname, 'requests.json');

// Ensure DB file exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '[]');
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // Helper to serve static files
    const serveStaticFile = (filePath, contentType) => {
        const fullPath = path.join(__dirname, filePath);
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    };

    // 1. Serving static files
    if (pathname === '/' || pathname === '/index.html') {
        serveStaticFile('index.html', 'text/html; charset=utf-8');
        return;
    }
    if (pathname === '/admin.html') {
        serveStaticFile('admin.html', 'text/html; charset=utf-8');
        return;
    }
    if (pathname === '/style.css') {
        serveStaticFile('style.css', 'text/css');
        return;
    }
    if (pathname === '/app.js') {
        serveStaticFile('app.js', 'application/javascript');
        return;
    }
    if (pathname === '/admin.js') {
        serveStaticFile('admin.js', 'application/javascript');
        return;
    }
    if (pathname.startsWith('/assets/')) {
        const ext = path.extname(pathname);
        let contentType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        serveStaticFile(pathname, contentType);
        return;
    }

    // 2. API Endpoints
    if (pathname === '/api/refunds') {
        const method = req.method;

        // GET /api/refunds
        if (method === 'GET') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || (authHeader !== 'admin123' && authHeader !== 'admin')) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized' }));
                return;
            }
            fs.readFile(DB_PATH, 'utf8', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data || '[]');
            });
            return;
        }

        // POST /api/refunds
        if (method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const newRequest = JSON.parse(body);
                    const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]');
                    dbData.unshift(newRequest);
                    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ result: 'success', id: newRequest.id }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
            });
            return;
        }

        // PUT /api/refunds
        if (method === 'PUT') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || (authHeader !== 'admin123' && authHeader !== 'admin')) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized' }));
                return;
            }
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const { id, status } = JSON.parse(body);
                    const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]');
                    const index = dbData.findIndex(r => r.id === id);
                    if (index !== -1) {
                        dbData[index].status = status;
                        fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ result: 'success' }));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Request not found' }));
                    }
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
            });
            return;
        }

        // DELETE /api/refunds
        if (method === 'DELETE') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || (authHeader !== 'admin123' && authHeader !== 'admin')) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized' }));
                return;
            }
            const id = url.searchParams.get('id');
            if (!id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing id parameter' }));
                return;
            }
            try {
                const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]');
                const filtered = dbData.filter(r => r.id !== id);
                fs.writeFileSync(DB_PATH, JSON.stringify(filtered, null, 2));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ result: 'success' }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }
    }

    // 404 Fallback
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Local development server running at http://localhost:${PORT}`);
});
