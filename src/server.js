/**
 * Servidor HTTP Nativo em Node.js (JavaScript)
 * Projeto: Simulador de Escalas e Custos de Folha - Malemi
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './api/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';

// Mapeamento de tipos MIME
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Tratamento de CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  // Roteamento de API
  if (url.pathname.startsWith('/api/')) {
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
      if (rawBody.length > 5 * 1024 * 1024) {
        // Limite de segurança: 5MB
        res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ erro: "Payload muito grande. Máximo permitido: 5MB." }));
        req.destroy();
      }
    });

    req.on('end', () => {
      let parsedBody = null;
      if (rawBody.trim().length > 0) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ erro: "JSON inválido fornecido na requisição." }));
        }
      }
      handleApiRequest(req, res, url, parsedBody);
    });
    return;
  }

  // Servidor de Arquivos Estáticos (Frontend em public/)
  let filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  
  // Prevenção contra Directory Traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end("Acesso proibido.");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Se não encontrou o arquivo, fallback para index.html para SPA ou 404
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end("Página não encontrada.");
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`  MALEMI DATA SOLUTIONS — SIMULADOR DE ESCALAS & FOLHA`);
  console.log(`  Servidor HTTP e API REST ativos com sucesso!`);
  console.log(`  URL Local:   http://${HOST}:${PORT}`);
  console.log(`  API Health:  http://${HOST}:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default server;
