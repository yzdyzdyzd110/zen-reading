import express from 'express';
import cors from 'cors';
import articlesRouter from './routes/articles';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/articles', articlesRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ZenReading backend running on http://0.0.0.0:${PORT}`);
});
