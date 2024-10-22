import { getStoredOrFetchCards } from './pokemonService';
import { PokemonCard } from '../types/pokemonCard';

export const getRandomBoosterCards = async (
    numCards: number,
    boosterName: string
): Promise<{ setId: number; name: string; cardIds: string[]}> => {
    // getSets() in pokemonService.ts and get a random set
    const sets = require('../data/sets.json');
    const randomSet = sets.data[Math.floor(Math.random() * sets.data.length)];
    

    const cards: PokemonCard[] = await getStoredOrFetchCards(randomSet.id);

    if (cards.length < numCards) {
        throw new Error('Not enough cards in the set to generate a booster');
    }

    const selectedCardIds = cards
        .sort(() => Math.random() - 0.5)
        .slice(0, numCards)
        .map(card => card.id);
    
    
    // // get the others card data using the card id
    // const cardNumbers = selectedCardIds.map(cardId => {
    //     return cards.find(card => card.id === cardId)?.hp || 'N/A';
    // });

    // const cardNames = selectedCardIds.map(cardId => {
    //     return cards.find(card => card.id === cardId)?.name || 'Unknown Card';
    // });

    // const cardImages = selectedCardIds.map(cardId => {
    //     return cards.find(card => card.id === cardId)?.images?.large || cards.find(card => card.id === cardId)?.images?.small || 'N/A';
    // });

    // return { name: boosterName, cardIds: selectedCardIds , cardNumbers: cardNumbers , cardNames: cardNames , cardImages: cardImages };
    return { setId: randomSet.id, name: boosterName, cardIds: selectedCardIds };
};
