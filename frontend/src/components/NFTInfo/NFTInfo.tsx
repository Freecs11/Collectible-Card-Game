import React, { FC, useEffect, useState } from 'react'
import './NFTInfo.css'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'
import axios from 'axios'
import { ethers } from 'ethers'

interface NFTInfoProps {
  wallet:
    | {
        details: ethereum.Details
        contract: main.Main
      }
    | undefined
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

const NFTInfo: FC<NFTInfoProps> = ({ wallet }) => {
  const [nftsByAddress, setNftsByAddress] = useState<CardDetails[]>([])
  const [boosters, setBoosters] = useState<string[]>([]) // Store booster IDs
  const [selectedBooster, setSelectedBooster] = useState<string | null>(null)
  const [boosterCards, setBoosterCards] = useState<CardDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const fetchNFTs = async () => {
    try {
      if (!wallet) return
      const ownerAddress = wallet.details.account

      // Fetch NFTs owned by the user
      const nfts = await wallet.contract.getNFTsByPlayer(ownerAddress)
      const nftIds = nfts.map((nft: { toString: () => any }) => nft.toString())

      // Fetch boosters owned by the user
      const boosterId = await wallet.contract.getBoosterByUser(ownerAddress)
      setBoosters([boosterId.toString()])

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

  const redeemBooster = async (boosterId: string) => {
    try {
      setStatusMessage(`Redeeming Booster ID: ${boosterId}...`)
      if (!wallet) return

      // Get booster details
      const boosterResponse = await wallet.contract.getBoosterCards(
        ethers.BigNumber.from(boosterId)
      )
      const cardIds = boosterResponse[0]
      const boosterCollectionName = boosterResponse[1]

      // Fetch detailed metadata
      const detailedCards = await Promise.all(
        cardIds.map(async (cardId: string) => {
          const apiUrl = `http://localhost:5000/api/cards/card/${cardId}`
          const response = await axios.get(apiUrl)
          const pokemonData = response.data

          return {
            tokenId: cardId,
            cardNumber: parseInt(pokemonData?.number) || 0,
            cardImageUrl:
              pokemonData?.images?.large || 'https://via.placeholder.com/150',
          }
        })
      )

      const finalCardIds = detailedCards.map(card => card.tokenId)
      const finalCardNumbers = detailedCards.map(card => card.cardNumber)
      const finalImageURIs = detailedCards.map(card => card.cardImageUrl)

      // Call the redeem function
      await wallet.contract.redeemBoosterAndCreateCollection(
        ethers.BigNumber.from(boosterId),
        wallet.details.account,
        boosterCollectionName,
        finalCardIds,
        finalCardNumbers,
        finalImageURIs,
        {
          // no fee or gas
          gasLimit: 0,
          gasPrice: 0,
        }
      )
      setStatusMessage(`Booster ID: ${boosterId} redeemed successfully!`)

      fetchNFTs()
      setSelectedBooster(null)
    } catch (error) {
      console.error('Error redeeming booster:', error)
      setStatusMessage('Failed to redeem booster.')
    }
  }

  const fetchBoosterCards = async (boosterId: string) => {
    try {
      if (!wallet) return
      setLoading(true)

      const boosterResponse = await wallet.contract.getBoosterCards(boosterId)
      const cardIds = boosterResponse[0]
      const boosterCollectionName = boosterResponse[1]

      console.log('Booster Response:', boosterResponse)

      const detailedCards = await Promise.all(
        cardIds
          .filter((cardId: string) => cardId && cardId.trim() !== '') // Filter out empty cardIds
          .map(async (cardId: string) => {
            try {
              const apiUrl = `http://localhost:5000/api/cards/card/${cardId}`
              const response = await axios.get(apiUrl)
              const pokemonData = response.data

              return {
                tokenId: cardId,
                cardName: pokemonData?.name || 'Unknown Card',
                cardImageUrl:
                  pokemonData?.images?.large || pokemonData?.images?.small,
                cardNumber: parseInt(pokemonData?.number) || 0,
                hp: pokemonData?.hp || 'N/A',
                level: pokemonData?.level || 'N/A',
                rarity: pokemonData?.rarity || 'Common',
              }
            } catch (error) {
              console.error(
                'Error fetching card metadata for ID:',
                cardId,
                error
              )
              return null // Return null or a placeholder object for failed fetches
            }
          })
      )

      setBoosterCards(detailedCards)
      setSelectedBooster(boosterId)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching booster cards:', error)
    }
  }

  const ownerAddress = wallet?.details.account

  const refreshBoosters = async () => {
    try {
      if (!wallet) return
      const ownerAddress = wallet.details.account

      // Fetch boosters owned by the user
      const boosterId = await wallet.contract.getBoosterByUser(ownerAddress)
      setBoosters([boosterId.toString()])
      console.log('Boosters:', boosters)
    } catch (error) {
      console.error('Error fetching boosters:', error)
    }
  }

  return (
    <div className="NFTInfo p-6">
      <h2 className="text-2xl font-bold mb-6 text-pokemonBlue">
        Your Pokémon Cards
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
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No NFTs owned.</p>
      )}

      {/* Display Boosters */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Your Boosters</h3>
        {boosters.length > 0 ? (
          <ul className="space-y-4">
            {boosters.map((boosterId, index) => (
              <li key={index} className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-sm font-medium">Booster ID: {boosterId}</p>
                <div className="flex space-x-4 mt-2">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                    onClick={() => fetchBoosterCards(boosterId)}
                    disabled={loading}
                  >
                    View Booster
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                    onClick={() => redeemBooster(boosterId)}
                    disabled={loading}
                  >
                    Redeem Booster
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No boosters available.</p>
        )}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 mt-4"
          onClick={refreshBoosters}
          disabled={loading}
        >
          Refresh Boosters
        </button>
      </div>

      {/* Modal for Booster */}
      {selectedBooster && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Booster Pack Contents</h3>
            <ul className="space-y-2">
              {boosterCards.map(card => (
                <li key={card.tokenId} className="flex items-center space-x-4">
                  <img
                    src={card.cardImageUrl}
                    alt={card.cardName}
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <p className="text-sm font-semibold">{card.cardName}</p>
                    <p className="text-xs text-gray-500">
                      HP: {card.hp} | Level: {card.level} | Rarity:{' '}
                      {card.rarity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                onClick={() => setSelectedBooster(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {statusMessage && <p className="text-gray-700 mt-4">{statusMessage}</p>}
    </div>
  )
}

export default NFTInfo
