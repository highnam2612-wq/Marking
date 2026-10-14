import type { Plugin } from 'vite';
import { evaluateIELTSSubmission, parseBulkBenchmarkData } from './gemini.ts';

export function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const buffers: Buffer[] = [];
        for await (const chunk of req) {
          buffers.push(chunk as Buffer);
        }
        const bodyStr = Buffer.concat(buffers).toString('utf-8');
        let body: any = {};
        if (bodyStr) {
          try {
            body = JSON.parse(bodyStr);
          } catch (e) {
            console.warn('Failed to parse JSON body:', e);
          }
        }

        res.setHeader('Content-Type', 'application/json');

        try {
          if (req.url === '/api/grade-submission' && req.method === 'POST') {
            const result = await evaluateIELTSSubmission(body);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/parse-benchmarks' && req.method === 'POST') {
            const result = await parseBulkBenchmarkData(body.rawText || '');
            res.statusCode = 200;
            res.end(JSON.stringify({ papers: result }));
            return;
          }

          if (req.url === '/api/fetch-drive-doc' && req.method === 'POST') {
            const { fileId, token } = body;
            if (!fileId || !token) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'fileId and token required' }));
              return;
            }

            const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
            const docRes = await fetch(exportUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (docRes.ok) {
              const text = await docRes.text();
              res.statusCode = 200;
              res.end(JSON.stringify({ text }));
              return;
            }

            const mediaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
            const mediaRes = await fetch(mediaUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (mediaRes.ok) {
              const text = await mediaRes.text();
              res.statusCode = 200;
              res.end(JSON.stringify({ text }));
              return;
            }

            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Unable to read drive file content' }));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (error: any) {
          console.error('Server error in IELTS API plugin:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error?.message || 'Server error' }));
        }
      });
    },
  };
}
