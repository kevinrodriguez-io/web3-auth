import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { postsRouter } from './routes/index.js';
const PORT = process.env.PORT;
const app = express();
// Middleware
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
// Routes
app.use('/posts', postsRouter);
// Handle 404
app.all('*', (req, res, next) => {
    res.status(404).send({ error: '404 Not Found' });
});
app.listen(PORT, () => {
    console.log(`🚚 Server listening on port ${PORT}`);
});
