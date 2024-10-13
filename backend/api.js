const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// CORS to allow requests from the frontend
app.use(cors());

const nftMetadata = {
  1: {
    name: 'Card 1',
    img: 'https://example.com/images/card1.png',
  },
  2: {
    name: 'Card 2',
    img: 'https://example.com/images/card2.png',
  },
  // Add more cards as needed
};

// Endpoint to get metadata for a specific NFT
app.get('/nft/:tokenId', (req, res) => {
  const tokenId = req.params.tokenId;
  const metadata = nftMetadata[tokenId];

  if (metadata) {
    console.log('Metadata found:', metadata);
    res.json(metadata);
  } else {
    console.log('NFT not found');
    res.status(404).json({ error: 'NFT not found' });
  }
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
