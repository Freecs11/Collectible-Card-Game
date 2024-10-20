import { Router } from 'express';
import { getCard, getSets, getStoredOrFetchCards, refreshCards } from '../services/pokemonService';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Get Pokémon cards from a set, using local storage if available
router.get('/:setId',authenticateAdmin, async (req, res) => {
  const { setId } = req.params;
  try {
    const cards = await getStoredOrFetchCards(setId);
    res.json(cards);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ message: error.message });
    else res.status(500).json({ message: 'Failed to fetch Pokémon cards' });
  }
});

// Refresh cards data for a set, force-fetching from the Pokémon API
router.post('/refresh/:setId', authenticateAdmin, async (req, res) => {
  const { setId } = req.params;
  try {
    const cards = await refreshCards(setId);
    res.json(cards);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ message: error.message });
    else res.status(500).json({ message: 'Failed to refresh Pokémon cards' });
  }
});

router.get('/sets/getAllSets', async (req, res) => {
  try {
    const sets = await getSets();
    res.json(sets);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ message: error.message });
    else res.status(500).json({ message: 'Failed to fetch Pokémon sets' });
  }
});

router.get('/card/:cardId', async (req, res) => {
  const { cardId } = req.params;
  try {
    const card = await getCard(cardId);
    res.json(card);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ message: error.message });
    else res.status(500).json({ message: 'Failed to fetch Pokémon card' });
    }
  }
);

export default router;
