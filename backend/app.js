import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import authRouter from './routes/auth.js';
import bandsRouter from './routes/bands.js';
import songsRouter from './routes/songs.js';
import setlistRouter from './routes/setlists.js';
import eventsRouter from './routes/events.js';
import channelsRouter from './routes/channels.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api', authRouter);
app.use('/api/bands', bandsRouter);
app.use('/api', songsRouter);
app.use('/api', setlistRouter);
app.use('/api', eventsRouter);
app.use('/api', channelsRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
