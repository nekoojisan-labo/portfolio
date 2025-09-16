const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// MIME types mapping
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Handle root path
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Construct file path
    const filePath = path.join(__dirname, pathname);
    
    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }
    
    // Get file extension
    const ext = path.parse(filePath).ext;
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // If directory, try to serve index.html
            fs.access(path.join(filePath, 'index.html'), fs.constants.F_OK, (indexErr) => {
                if (!indexErr) {
                    // Serve index.html from directory
                    const indexPath = path.join(filePath, 'index.html');
                    fs.readFile(indexPath, (readErr, content) => {
                        if (readErr) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('500 Internal Server Error');
                            return;
                        }
                        res.writeHead(200, { 
                            'Content-Type': 'text/html',
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.end(content, 'utf-8');
                    });
                } else {
                    // File not found
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                }
            });
            return;
        }
        
        // Check if it's a directory
        fs.stat(filePath, (statErr, stats) => {
            if (statErr) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }
            
            if (stats.isDirectory()) {
                // Try to serve index.html from directory
                const indexPath = path.join(filePath, 'index.html');
                fs.access(indexPath, fs.constants.F_OK, (indexErr) => {
                    if (!indexErr) {
                        fs.readFile(indexPath, (readErr, content) => {
                            if (readErr) {
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('500 Internal Server Error');
                                return;
                            }
                            res.writeHead(200, { 
                                'Content-Type': 'text/html',
                                'Access-Control-Allow-Origin': '*'
                            });
                            res.end(content, 'utf-8');
                        });
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('404 Not Found - Directory index not available');
                    }
                });
            } else {
                // Serve file
                fs.readFile(filePath, (readErr, content) => {
                    if (readErr) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('500 Internal Server Error');
                        return;
                    }
                    
                    res.writeHead(200, { 
                        'Content-Type': mimeType,
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(content);
                });
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});