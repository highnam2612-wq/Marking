import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { evaluateIELTSSubmission, parseBulkBenchmarkData } from './src/server/gemini.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// API routes
app.post('/api/grade-submission', async (req, res) => {
  try {
    const result = await evaluateIELTSSubmission(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error evaluating IELTS submission:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate submission' });
  }
});

app.post('/api/parse-benchmarks', async (req, res) => {
  try {
    const result = await parseBulkBenchmarkData(req.body.rawText || '');
    res.json({ papers: result });
  } catch (error: any) {
    console.error('Error parsing benchmark papers:', error);
    res.status(500).json({ error: error.message || 'Failed to parse benchmarks' });
  }
});

app.post('/api/fetch-drive-doc', async (req, res) => {
  const { fileId, token } = req.body;
  if (!fileId || !token) {
    return res.status(400).json({ error: 'fileId and token required' });
  }

  try {
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
    const docRes = await fetch(exportUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (docRes.ok) {
      const text = await docRes.text();
      return res.json({ text });
    }

    const mediaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const mediaRes = await fetch(mediaUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (mediaRes.ok) {
      const text = await mediaRes.text();
      return res.json({ text });
    }

    res.status(400).json({ error: 'Unable to read drive file content' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch drive file' });
  }
});

// Serve frontend dist assets in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`IELTS Examiner Server listening on http://0.0.0.0:${PORT}`);
});
