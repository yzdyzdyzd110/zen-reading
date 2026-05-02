import express from 'express';
import cors from 'cors';
import path from 'path';
import articlesRouter from './routes/articles';
import vocabularyRouter from './routes/vocabulary';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/articles', articlesRouter);
app.use('/api/vocabulary', vocabularyRouter);

// Serve built frontend in production
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ZenReading backend running on http://0.0.0.0:${PORT}`);
});
