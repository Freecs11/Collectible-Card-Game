import dotenv from 'dotenv';

export const loadEnv = (): void => {
  dotenv.config();
  if (!process.env.POKEMON_TCG_API_KEY) {
    throw new Error('Missing POKEMON_TCG_API_KEY in environment variables');
  }
};
