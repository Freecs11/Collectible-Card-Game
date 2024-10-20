import express from 'express';
import dotenv from 'dotenv';
import cardsRouter from './routes/cards';
import { loadEnv } from './utils/env';
import boosterRouter from './routes/booster';

var cors = require("cors");

dotenv.config();
loadEnv();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: '*', // Allows all origins - adjust for production use
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());



// Register routes
app.use('/api/cards', cardsRouter);
app.use('/api/booster', boosterRouter);


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
