// components/Collections/Collections.tsx
import React, { FC, useEffect, useState } from 'react'
import axios from 'axios'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'
import { ethers } from 'ethers' // Import ethers for blockchain interactions
import Modal from './Modal'
import contracts from '../contracts.json'

interface CollectionsProps {
  wallet: {
    details: ethereum.Details
    contract: main.Main
  }
}

interface CardDetails {
  tokenId: string
  cardName: string
  cardImageUrl: string
  cardNumber: number
  collectionName: string
  hp: string
  level: string
  rarity: string
}

const Collections: FC<CollectionsProps> = ({ wallet }) => {
  const [nftsByAddress, setNftsByAddress] = useState<CardDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardDetails | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [price, setPrice] = useState<string>('')

  const fetchNFTs = async () => {
    try {
      if (!wallet) return
      const ownerAddress = wallet.details.account

      // Fetch NFTs owned by the user
      const nfts = await wallet.contract.getNFTsByPlayer(ownerAddress)
      const nftIds = nfts.map((nft: { toString: () => any }) => nft.toString())

      // Fetch detailed card information for each NFT
      const detailedCards = await Promise.all(
        nftIds.map(async (tokenId: any) => {
          const metadata = await wallet.contract.getCardMetadata(tokenId)
          const { cardIds, cardNumber, imageURI, collectionId } = metadata
          const collectionName = await wallet.contract.getCollectionByCardId(
            tokenId
          )

          const apiUrl = `http://localhost:5000/api/cards/card/${cardIds}`
          const response = await axios.get(apiUrl)
          const pokemonData = response.data

          return {
            tokenId,
            cardName: pokemonData?.name || 'Unknown Card',
            cardImageUrl: pokemonData?.images?.large || imageURI,
            cardNumber,
            collectionName,
            hp: pokemonData?.hp || 'N/A',
            level: pokemonData?.level || 'N/A',
            rarity: pokemonData?.rarity || 'Common',
          }
        })
      )

      setNftsByAddress(detailedCards)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
    }
  }

  useEffect(() => {
    if (!wallet) return
    fetchNFTs()
  }, [wallet])

  const ownerAddress = wallet?.details.account

  // Function to open the modal for a specific card
  const handleSellClick = (card: CardDetails) => {
    setSelectedCard(card)
    setShowModal(true)
  }

  const handleListCard = async (price: string) => {
    try {
      if (!wallet || !selectedCard) return
      const signer = wallet.details.signer

      // Load contract data from JSON file
      const marketAddress = contracts.contracts.Market.address

      const marketContract = new ethers.Contract(
        marketAddress,
        contracts.contracts.Market.abi,
        signer
      )

      const cardContract = new ethers.Contract(
        contracts.contracts.Card.address,
        contracts.contracts.Card.abi,
        signer
      )

      // Approve the Market contract for this specific NFT
      const approveTx = await cardContract.approve(
        marketAddress,
        selectedCard.tokenId
      )
      await approveTx.wait()

      // List the card
      const listingPrice = ethers.utils.parseEther(price)
      const listTx = await marketContract.listCard(
        selectedCard.tokenId,
        listingPrice
      )
      await listTx.wait()

      alert('Card listed successfully!')
      setShowModal(false)
      fetchNFTs() // Refresh the NFTs list
    } catch (error) {
      console.error('Error listing card:', error)
      alert('Failed to list the card. Please try again.')
    }
  }

  return (
    <div className="Collections p-6">
      <h2 className="text-2xl font-bold mb-6 text-pokemonBlue">
        Your Pokémon Collections
      </h2>
      <p className="mb-4 text-gray-700">
        Owner: <span className="text-pokemonBlue">{ownerAddress}</span>
      </p>
      {nftsByAddress.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nftsByAddress.map(card => (
            <li
              key={card.tokenId}
              className="bg-white p-4 rounded-lg shadow-card hover:shadow-lg transition duration-300 border border-gray-200 transform hover:scale-105"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {card.cardName}
              </h3>
              <div className="w-full h-48 bg-lightYellow rounded overflow-hidden shadow-inner relative">
                <img
                  src={card.cardImageUrl}
                  alt={`Pokémon Card ${card.cardName}`}
                  className="w-full h-full object-contain rounded"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                  <span className="text-white text-sm">
                    Collection: {card.collectionName}
                  </span>
                  <span className="text-white text-sm">
                    HP: {card.hp} | Level: {card.level}
                  </span>
                  <span className="text-white text-sm">
                    Rarity: {card.rarity}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Token ID: {card.tokenId}
              </p>
              <button
                onClick={() => handleSellClick(card)}
                className="mt-2 bg-pokemonBlue text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Sell
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No NFTs owned.</p>
      )}

      {/* Sell Modal */}
      {showModal && selectedCard && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-xl font-bold mb-4">List Card for Sale</h2>
          <p className="mb-2">Card: {selectedCard.cardName}</p>
          <p className="mb-4">Token ID: {selectedCard.tokenId}</p>
          <div>
            <label className="block mb-2">Price in ETH:</label>
            <input
              type="text"
              className="w-full px-3 py-2 mb-4 border rounded"
              placeholder="Enter price"
              onChange={e => setPrice(e.target.value)}
            />
            <button
              onClick={() => handleListCard(price)}
              className="bg-pokemonYellow px-4 py-2 rounded hover:bg-yellow-400 transition"
            >
              Confirm Listing
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Collections
