import { getStoredOrFetchCards } from './pokemonService';
import { PokemonCard } from '../types/pokemonCard';

export const getRandomBoosterCards = async (
    setId: string,
    numCards: number,
    boosterName: string
): Promise<{ name: string; cardIds: string[]}> => {
    const cards: PokemonCard[] = await getStoredOrFetchCards(setId);

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
    return { name: boosterName, cardIds: selectedCardIds };
};
