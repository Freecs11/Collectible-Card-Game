import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.pokemontcg.io/v2',
  headers: {
    'X-Api-Key': process.env.POKEMON_TCG_API_KEY || '',
  },
});

export default api;
