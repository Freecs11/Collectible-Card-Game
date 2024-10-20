import api from '../config/axiosConfig';
import { PokemonCard } from '../types/pokemonCard';
import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../data/cards.json');

// Helper to read the local storage file
const readLocalStorage = (): Record<string, PokemonCard[]> => {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

// Helper to write to the local storage file
const writeLocalStorage = (data: Record<string, PokemonCard[]>) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Fetch cards from Pokémon API and store locally
export const fetchAndStoreCards = async (set: string): Promise<PokemonCard[]> => {
  try {
    const response = await api.get(`/cards`, {
      params: {
        q: `set.id:${set}`,
        pageSize: 10, // Adjust as needed
      },
    });

    const cards: PokemonCard[] = response.data.data;

    // Store in local storage
    const storage = readLocalStorage();
    storage[set] = cards;
    writeLocalStorage(storage);

    return cards;
  } catch (error) {
    throw new Error(`Failed to fetch Pokémon cards: ${error}`);
  }
};

// Get cards from local storage, or fetch if not available
export const getStoredOrFetchCards = async (set: string): Promise<PokemonCard[]> => {
  const storage = readLocalStorage();
  
  // Check if the set is already in local storage
  if (storage[set]) {
    console.log(`Returning cards for set ${set} from local storage`);
    return storage[set];
  }

  // Fetch and store if not available
  console.log(`Fetching cards for set ${set} from the Pokémon TCG API`);
  return await fetchAndStoreCards(set);
};

// Refresh local storage with new data from the API
export const refreshCards = async (set: string): Promise<PokemonCard[]> => {
  console.log(`Refreshing cards for set ${set} from the Pokémon TCG API`);
  return await fetchAndStoreCards(set);
};


// Get all available sets ( ids )
export const getSets = async (): Promise<string[]> => {
  const sets = require('../data/sets.json');
  return sets.data.map((set: any) => set.id);
}


// Get a single card by id
export const getCard = async (cardId: string): Promise<PokemonCard> => {
  try {
    const response = await api.get(`/cards/${cardId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to fetch Pokémon card: ${error}`);
  }
};