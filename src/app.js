import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Export app for serverless
export default app;

