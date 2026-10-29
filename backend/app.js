import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import authRouter from './routes/auth.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api', authRouter);
app.use(notFoundHandler)
app.use(errorHandler)

export default app;
