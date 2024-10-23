// components/Marketplace/Marketplace.tsx
import React, { FC, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'
import contracts from '../contracts.json'

interface MarketplaceProps {
  wallet: {
    details: ethereum.Details
    contract: main.Main
  }
}

interface Listing {
  cardId: string
  seller: string
  price: string
  isActive: boolean
  cardDetails: CardDetails
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

const Marketplace: FC<MarketplaceProps> = ({ wallet }) => {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const marketAddress = contracts.contracts.Market.address
  const marketABI = contracts.contracts.Market.abi

  const fetchListings = async () => {
    setLoading(true)
    try {
      const marketContract = new ethers.Contract(
        marketAddress,
        marketABI,
        wallet.details.provider
      )

      const activeListings = await marketContract.getActiveListings()

      // Fetch detailed card information for each listing
      const listingsWithDetails = await Promise.all(
        activeListings.map(async (listing: any) => {
          const { cardId, seller, price, isActive } = listing
          const metadata = await wallet.contract.getCardMetadata(cardId)
          const { cardIds, cardNumber, imageURI } = metadata
          const collectionName = await wallet.contract.getCollectionByCardId(
            cardId
          )

          const apiUrl = `http://localhost:5000/api/cards/card/${cardIds}`
          const response = await axios.get(apiUrl)
          const pokemonData = response.data

          const cardDetails = {
            tokenId: cardId.toString(),
            cardName: pokemonData?.name || 'Unknown Card',
            cardImageUrl: pokemonData?.images?.large || imageURI,
            cardNumber,
            collectionName,
            hp: pokemonData?.hp || 'N/A',
            level: pokemonData?.level || 'N/A',
            rarity: pokemonData?.rarity || 'Common',
          }

          return {
            cardId: cardId.toString(),
            seller,
            price: price.toString(),
            isActive,
            cardDetails,
          }
        })
      )

      setListings(listingsWithDetails)
    } catch (error) {
      console.error('Error fetching listings:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!wallet) return
    fetchListings()
  }, [wallet])

  const handleBuy = async (listing: Listing) => {
    try {
      if (!wallet) return
      const signer = wallet.details.signer

      const marketContract = new ethers.Contract(
        marketAddress,
        marketABI,
        signer
      )

      const tx = await marketContract.buyCard(listing.cardId, {
        value: listing.price,
      })
      await tx.wait()

      alert('Card purchased successfully!')
      // Refresh listings
      fetchListings()
    } catch (error) {
      console.error('Error buying card:', error)
      alert('Failed to buy the card. Please try again.')
    }
  }

  const handleCancelListing = async (listing: Listing) => {
    try {
      if (!wallet) return
      const signer = wallet.details.signer

      const marketContract = new ethers.Contract(
        marketAddress,
        marketABI,
        signer
      )

      const tx = await marketContract.cancelListing(listing.cardId)
      await tx.wait()

      alert('Listing canceled successfully!')
      // Refresh listings
      fetchListings()
    } catch (error) {
      console.error('Error canceling listing:', error)
      alert('Failed to cancel the listing. Please try again.')
    }
  }

  const userAddress = wallet?.details?.account?.toLowerCase()

  return (
    <div className="Marketplace p-6">
      <h2 className="text-2xl font-bold mb-6 text-pokemonBlue">Marketplace</h2>
      {loading ? (
        <p>Loading listings...</p>
      ) : listings.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <li
              key={listing.cardId}
              className="bg-white p-4 rounded-lg shadow-card hover:shadow-lg transition duration-300 border border-gray-200 transform hover:scale-105"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {listing.cardDetails.cardName}
              </h3>
              <div className="w-full h-48 bg-lightYellow rounded overflow-hidden shadow-inner relative">
                <img
                  src={listing.cardDetails.cardImageUrl}
                  alt={`Pokémon Card ${listing.cardDetails.cardName}`}
                  className="w-full h-full object-contain rounded"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                  <span className="text-white text-sm">
                    Collection: {listing.cardDetails.collectionName}
                  </span>
                  <span className="text-white text-sm">
                    HP: {listing.cardDetails.hp} | Level:{' '}
                    {listing.cardDetails.level}
                  </span>
                  <span className="text-white text-sm">
                    Rarity: {listing.cardDetails.rarity}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Token ID: {listing.cardId}
              </p>
              <p className="text-sm text-gray-500">
                Price: {ethers.utils.formatEther(listing.price)} ETH
              </p>
              {listing.seller.toLowerCase() === userAddress ? (
                <button
                  onClick={() => handleCancelListing(listing)}
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Cancel Listing
                </button>
              ) : (
                <button
                  onClick={() => handleBuy(listing)}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Buy
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No listings available.</p>
      )}
    </div>
  )
}

export default Marketplace
