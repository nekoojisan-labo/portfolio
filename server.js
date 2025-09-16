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

// セーブディレクトリの作成
const saveDir = path.join(__dirname, 'saves');
if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir);
}

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // API エンドポイント
    if (pathname.startsWith('/api/')) {
        handleApiRequest(req, res, pathname);
        return;
    }
    
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

// API リクエストハンドラー
function handleApiRequest(req, res, pathname) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // CORS プリフライトリクエストの処理
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }
    
    if (pathname === '/api/saves') {
        if (req.method === 'GET') {
            getSaveSlots(res, corsHeaders);
        } else if (req.method === 'POST') {
            saveSaveData(req, res, corsHeaders);
        } else {
            res.writeHead(405, corsHeaders);
            res.end('Method Not Allowed');
        }
    } else {
        res.writeHead(404, corsHeaders);
        res.end('API endpoint not found');
    }
}

// セーブスロット一覧取得
function getSaveSlots(res, corsHeaders) {
    try {
        const saveSlots = [];
        for (let i = 0; i < 6; i++) { // 6個のセーブスロット
            const saveFile = path.join(saveDir, `save_${i}.json`);
            if (fs.existsSync(saveFile)) {
                const saveData = JSON.parse(fs.readFileSync(saveFile, 'utf8'));
                saveSlots[i] = saveData;
            } else {
                saveSlots[i] = null;
            }
        }
        
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify(saveSlots));
    } catch (error) {
        console.error('セーブスロット読み込みエラー:', error);
        res.writeHead(500, corsHeaders);
        res.end('Internal Server Error');
    }
}

// セーブデータ保存
function saveSaveData(req, res, corsHeaders) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const saveData = JSON.parse(body);
            const slotIndex = saveData.slotIndex || 0;
            const saveFile = path.join(saveDir, `save_${slotIndex}.json`);
            
            // セーブファイルに書き込み
            fs.writeFileSync(saveFile, JSON.stringify(saveData, null, 2));
            
            res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'セーブ完了' }));
        } catch (error) {
            console.error('セーブエラー:', error);
            res.writeHead(500, corsHeaders);
            res.end('Save Error');
        }
    });
}

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