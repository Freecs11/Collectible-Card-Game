import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth';
import { getRandomBoosterCards } from '../services/boosterService';

const router = Router();

router.get('/generate/:setId/:numCards/:boosterName', async (req, res) => {
    const { setId, numCards, boosterName } = req.params;

    try {
        const booster = await getRandomBoosterCards(setId, parseInt(numCards), boosterName);
        res.json(booster);
    } catch (error) {
        if (error instanceof Error) res.status(500).json({ message: error.message });
        else res.status(500).json({ message: 'Failed to generate booster cards' });
    }
});

export default router;
