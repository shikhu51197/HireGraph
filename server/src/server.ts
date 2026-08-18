import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import candidateRoutes from './routes/candidates';
import jobRoutes from './routes/jobs';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
