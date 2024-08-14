import express, { Express,Request,Response } from 'express';
import config from './config';
// import routes from './routes';

const app: express.Application = express();

app.use(express.json());
// app.use('/api', routes);

const PORT: number = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
