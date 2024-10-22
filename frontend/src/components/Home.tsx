// components/Home/Home.tsx
import React, { FC, useEffect, useState } from 'react'
import axios from 'axios'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'
import { ethers } from 'ethers'
import arrowleft from '/arrow.png'
import arrowright from '/arrow_r.png'

interface HomeProps {
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
  owner: string
}

const Home: FC<HomeProps> = ({ wallet }) => {
  const [cards, setCards] = useState<CardDetails[]>([])
  const [loading, setLoading] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const cardsPerPage = 10

  useEffect(() => {
    if (!wallet) return

    const fetchAllCards = async () => {
      try {
        setLoading(true)

        // Call getNFTsAndOwnersFromAllCollections
        const [nftIds, owners] =
          await wallet.contract.getNFTsAndOwnersFromAllCollections()

        const nftIdNumbers = nftIds.map((id: ethers.BigNumber) => id.toNumber())

        const cardsData: CardDetails[] = await Promise.all(
          nftIdNumbers.map(async (nftId, index) => {
            const owner = owners[index]

            // Get card metadata from the contract
            const cardMetadata = await wallet.contract.getCardMetadata(nftId)

            const cardId = cardMetadata[0] // cardIds
            const cardNumber = cardMetadata[1] // cardNumber
            const imageURI = cardMetadata[2] // imageURI

            // Fetch card details from backend API using cardId
            const apiUrl = `http://localhost:5000/api/cards/card/${cardId}`
            const response = await axios.get(apiUrl)
            const pokemonData = response.data

            const cardData: CardDetails = {
              tokenId: nftId.toString(),
              cardName: pokemonData?.name || 'Unknown Card',
              cardImageUrl:
                pokemonData?.images?.large || pokemonData?.images?.small,
              cardNumber: parseInt(pokemonData?.number) || 0,
              hp: pokemonData?.hp || 'N/A',
              level: pokemonData?.level || 'N/A',
              rarity: pokemonData?.rarity || 'Common',
              owner: owner,
            }

            return cardData
          })
        )

        setCards(cardsData)
      } catch (error) {
        console.error('Error fetching all cards:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllCards()
  }, [wallet])

  // Get the user's own address
  const userAddress = wallet?.details.account

  // Calculate total pages
  const totalPages = Math.ceil(cards.length / cardsPerPage)

  // Get current page cards
  const indexOfLastCard = currentPage * cardsPerPage
  const indexOfFirstCard = indexOfLastCard - cardsPerPage
  const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard)

  // Handlers for pagination
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  function shortenAddress(address: string) {
    return address
      ? `${address.substring(0, 10)}...${address.substring(address.length - 4)}`
      : ''
  }
  return (
    <div className="Home p-6 relative">
      <h2 className="text-3xl font-bold mb-4">All Cards</h2>
      {loading ? (
        <p>Loading cards...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentCards.map(card => (
              <div key={card.tokenId} className="relative group">
                <img
                  src={card.cardImageUrl}
                  alt={card.cardName}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center p-4 w-full">
                    <p className="text-lg font-bold">{card.cardName}</p>
                    <p>HP: {card.hp}</p>
                    <p>Level: {card.level}</p>
                    <p>Rarity: {card.rarity}</p>
                    <p className="truncate">
                      Owner:{' '}
                      {userAddress &&
                      card.owner.toLowerCase() === userAddress.toLowerCase()
                        ? 'You'
                        : shortenAddress(card.owner)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`absolute left-[-3.5rem] top-1/2 transform -translate-y-1/2 focus:outline-none ${
                  currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <img
                  src={arrowleft}
                  alt="Previous Page"
                  className="w-12 h-12 transform hover:scale-110 transition-transform duration-200"
                />
              </button>

              {/* Right Arrow */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`absolute right-[-3.5rem] top-1/2 transform -translate-y-1/2 focus:outline-none ${
                  currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <img
                  src={arrowright}
                  alt="Next Page"
                  className="w-12 h-12 transform hover:scale-110 transition-transform duration-200"
                />
              </button>

              {/* Page Indicator */}
              <div className="absolute bottom-[-2.5rem] left-1/2 transform -translate-x-1/2 mb-4 text-lg">
                Page {currentPage} of {totalPages}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Home
