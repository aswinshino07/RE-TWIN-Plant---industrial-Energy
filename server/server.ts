import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use('/api', apiRoutes);

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root,
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(root, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(root, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RE-TWIN Plant Server running on http://0.0.0.0:${PORT} (${isProd ? 'Production' : 'Development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
