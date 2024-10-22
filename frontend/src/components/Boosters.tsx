// components/Boosters/Boosters.tsx
import React, { FC, useEffect, useState } from 'react'
import axios from 'axios'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'
import { ethers } from 'ethers'
import contracts from '@/contracts.json'
import type { ContractInterface } from 'ethers'

interface BoostersProps {
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
  hp: string
  level: string
  rarity: string
}

const Boosters: FC<BoostersProps> = ({ wallet }) => {
  const [boosters, setBoosters] = useState<string[]>([])
  const [selectedBooster, setSelectedBooster] = useState<string | null>(null)
  const [selectedBoosterName, setSelectedBoosterName] = useState<string>('')
  const [boosterCards, setBoosterCards] = useState<CardDetails[]>([])
  const [boosterCollectionNames, setBoosterCollectionNames] = useState<
    string[]
  >([])
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // Cache for booster cards
  const [boosterCardsCache, setBoosterCardsCache] = useState<{
    [boosterId: string]: {
      cards: CardDetails[]
      name: string
    }
  }>({})

  const refreshBoosters = async () => {
    try {
      if (!wallet || !wallet.details.account) return

      console.log(
        'Wallet refresh address:',
        ethers.utils.getAddress(wallet.details.account)
      )

      // Fetch boosters owned by the user
      const boostersResponse = await wallet.contract.getBoostersByPlayer(
        ethers.utils.getAddress(wallet.details.account)
      )

      console.log('Boosters:', boostersResponse)

      // Convert BigNumber booster IDs to strings
      const boosterIds = boostersResponse[0].map(
        (boosterId: ethers.BigNumber) => boosterId.toString()
      )
      setBoosters(boosterIds)

      const boosterCollectionNames = boostersResponse[1]
      setBoosterCollectionNames(boosterCollectionNames)

      console.log('Booster Collection Names:', boosterCollectionNames)
    } catch (error) {
      console.error('Error fetching boosters:', error)
    }
  }

  useEffect(() => {
    if (!wallet) return
    refreshBoosters()
  }, [wallet])

  const createBooster = async () => {
    try {
      if (!wallet || !wallet.details.account) return

      setLoading(true)
      setStatusMessage('Creating booster...')

      // Initialize ethers provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      const userAddress = await signer.getAddress()

      // Get Main contract ABI and address
      const abi = contracts.contracts.Main.abi as ContractInterface
      const contractAddress = contracts.contracts.Main.address

      const contract = new ethers.Contract(contractAddress, abi, signer)

      // Correct date formatting
      const datenow = new Date().toISOString().replace(/[-:.TZ]/g, '')
      const boosterName = `Booster_${datenow}`
      const boosterNumber = 5 // Fixed number of cards

      // Call backend to generate booster
      const response = await axios.get(
        `http://localhost:5000/api/booster/generate/${boosterNumber}/${boosterName}`
      )

      console.log('Response data:', response.data)

      const boosterName_res = response.data.name
      const cardIds = response.data.cardIds

      console.log('User Address create Booster:', userAddress)

      // Validate response data
      if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
        throw new Error('Invalid cardIds received from backend')
      }

      // Call the contract to create the booster
      const tx = await contract.createBoosterForPlayer(
        userAddress,
        cardIds,
        boosterName_res,
        {
          nonce: await provider.getTransactionCount(userAddress, 'latest'),
        }
      )

      // Wait for transaction confirmation
      await tx.wait()

      setStatusMessage('Booster created successfully!')
      refreshBoosters()
    } catch (error) {
      console.error('Error creating booster:', error)
      setStatusMessage('Failed to create booster.')
    } finally {
      setLoading(false)
    }
  }

  const fetchBoosterCards = async (boosterId: string) => {
    try {
      if (!wallet) return
      setLoading(true)

      // Check if booster cards are already cached
      if (boosterCardsCache[boosterId]) {
        console.log('Fetching booster cards from cache')
        setBoosterCards(boosterCardsCache[boosterId].cards)
        setSelectedBoosterName(boosterCardsCache[boosterId].name)
        setSelectedBooster(boosterId)
        return
      }

      if (!boosterId || boosterId.trim() === '') return

      const boosterResponse = await wallet.contract.getBoosterCards(boosterId)

      const cardIds = boosterResponse[0]
      const boosterCollectionName = boosterResponse[1]

      const detailedCards = await Promise.all(
        cardIds
          .filter((cardId: string) => cardId && cardId.trim() !== '')
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
              return null
            }
          })
      )

      // Filter out any null results
      const validCards = detailedCards.filter(
        card => card !== null
      ) as CardDetails[]

      // Cache the booster cards
      setBoosterCardsCache(prevCache => ({
        ...prevCache,
        [boosterId]: {
          cards: validCards,
          name: boosterCollectionName,
        },
      }))

      setBoosterCards(validCards)
      setSelectedBooster(boosterId)
      setSelectedBoosterName(boosterCollectionName)
    } catch (error) {
      console.error('Error fetching booster cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const redeemBooster = async (boosterId: string) => {
    try {
      setStatusMessage(`Redeeming Booster ID: ${boosterId}...`)
      if (!wallet || !wallet.details.account) return

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      const userAddress = await signer.getAddress()

      // Get Main contract instance with signer
      const contract = wallet.contract.connect(signer)

      // Get booster details
      const boosterResponse = await contract.getBoosterCards(boosterId)

      // Extract card IDs and booster collection name
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
              pokemonData?.images?.large || pokemonData?.images?.small,
          }
        })
      )

      const finalCardIds = detailedCards.map(card => card.tokenId)
      const finalCardNumbers = detailedCards.map(card => card.cardNumber)
      const finalImageURIs = detailedCards.map(card => card.cardImageUrl)

      // Redeem booster and create collection
      const tx = await contract.redeemBoosterAndCreateCollection(
        boosterId,
        userAddress,
        boosterCollectionName,
        finalCardIds,
        finalCardNumbers,
        finalImageURIs,
        {
          value: ethers.utils.parseEther('0.01'),
          nonce: await provider.getTransactionCount(userAddress, 'latest'),
        }
      )

      // Wait for transaction confirmation
      await tx.wait()

      // Remove the booster from the cache since it's redeemed
      setBoosterCardsCache(prevCache => {
        const newCache = { ...prevCache }
        delete newCache[boosterId]
        return newCache
      })

      setStatusMessage(`Booster ID: ${boosterId} redeemed successfully!`)
      refreshBoosters()
    } catch (error) {
      console.error('Error redeeming booster:', error)
      setStatusMessage('Failed to redeem booster.')
    }
  }

  return (
    <div className="Boosters p-6">
      <h2 className="text-2xl font-bold mb-6 text-pokemonBlue">
        Your Boosters
      </h2>
      <button
        className="bg-pokemonBlue text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 mb-4"
        onClick={createBooster}
        disabled={loading}
      >
        {loading ? 'Creating Booster...' : 'Create Booster'}
      </button>

      {/* Refresh button */}
      <button
        className="bg-pokemonBlue text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 mb-4 ml-4"
        onClick={refreshBoosters}
        disabled={loading}
      >
        {loading ? 'Refreshing Boosters...' : 'Refresh Boosters'}
      </button>

      {statusMessage && <p className="text-gray-700 mt-4">{statusMessage}</p>}
      {boosters.length > 0 ? (
        <ul className="space-y-4">
          {boosters.map((boosterId, index) => (
            <li key={index} className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-sm font-medium">Booster ID: {boosterId}</p>
              <p className="text-sm text-gray-500">
                Collection: {boosterCollectionNames[index]}
              </p>
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
      {/* Modal for Booster */}
      {selectedBooster && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Booster Pack Contents</h3>
            <p className="text-sm text-gray-500 mb-4">
              Booster collection: {selectedBoosterName}
            </p>
            <ul className="space-y-2">
              {boosterCards.map(card => (
                <li className="flex items-center space-x-4" key={card.tokenId}>
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
    </div>
  )
}

export default Boosters
