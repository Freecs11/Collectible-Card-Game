import React, { FC, useEffect, useState } from 'react'
import axios from 'axios'
import * as main from '@/lib/main'
import Web3 from 'web3'

interface PokemonCard {
  id: string
  name: string
  imageUrl: string
  cardNumber?: number
  hp?: number
}

const transformApiDataToPokemonCards = (data: any[]): PokemonCard[] => {
  return data.map(item => ({
    id: item.id,
    name: item.name,
    imageUrl: item.images?.large || item.images?.small || '', // Use large image if available
    cardNumber: parseInt(item.level, 10), // we use the level as the card number
    hp: parseInt(item.hp, 10),
  }))
}

const Admin = () => {
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [cards, setCards] = useState<PokemonCard[]>([])
  const [selectedCards, setSelectedCards] = useState<PokemonCard[]>([])
  const [collectionName, setCollectionName] = useState<string>('')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [userAddress, setUserAddress] = useState<string>('')
  const [users, setUsers] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [setId, setSetId] = useState<string>('')
  const [setIds, setSetIds] = useState<string[]>([])
  const [collections, setCollections] = useState<
    { id: number; name: string; cardCount: number }[]
  >([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null)
  const [collectionCardCount, setCollectionCardCount] = useState<number>(0)
  const [boosterNumber, setBoosterNumber] = useState<number>(0)
  const [boosterName, setBoosterName] = useState<string>('')

  const adminPassword = localStorage.getItem('adminPassword')

  // contract address
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  const owner_address = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  const web3 = new Web3('http://localhost:8545')

  let contractAbi = main.myAbi()
  let contract = new web3.eth.Contract(contractAbi, contractAddress)

  useEffect(() => {
    // Fetch the list of set IDs from the backend
    const fetchSetIds = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/cards/sets/getAllSets'
        )
        setSetIds(response.data)
      } catch (error) {
        console.error('Error fetching set IDs:', error)
      }
    }

    fetchSetIds()
  }, [])

  // random selection of a set ID
  const selectRandomSet = () => {
    if (setIds.length > 0) {
      const randomIndex = Math.floor(Math.random() * setIds.length)
      setSetId(setIds[randomIndex])
    }
  }

  useEffect(() => {
    setIsOwner(true)
    fetchUsers()
    fetchCollections()
  }, [])

  // Fetch collections from the contract
  const fetchCollections = async () => {
    try {
      // Call the function to get the collections
      const result = await contract.methods.getAllCollections().call()

      // Ensure that the result is in the expected format
      const collectionIds = result[0]
      const collectionNames = result[1]
      const collectionCardCounts = result[2]

      // Map the collections into a structured object
      const collections = collectionIds.map(
        (id: { toString: () => string }, index: string | number) => ({
          id: parseInt(id.toString()), // Ensure the ID is a number
          name: collectionNames[index],
          cardCount: parseInt(collectionCardCounts[index].toString()), // Ensure the card count is a number
        })
      )

      setCollections(collections)
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }

  // Authenticate admin and fetch cards from the backend
  const fetchCards = async () => {
    if (!adminPassword) {
      console.error('Admin password is missing.')
      return
    }

    try {
      setLoading(true)
      const response = await axios.get(
        `http://localhost:5000/api/cards/${setId}`,
        {
          headers: {
            Authorization: 'Basic ' + btoa(`${'a'}:${adminPassword}`),
          },
        }
      )
      const transformedCards = transformApiDataToPokemonCards(response.data)
      setCards(transformedCards)
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all users (i.e., owners of NFTs) from the contract
  const fetchUsers = async () => {
    try {
      // Call the function and get the users array directly
      const usersall = await contract.methods.getAllUsers().call()

      // Convert the addresses to strings (if needed)
      const usersString = usersall.map((user: { toString: () => any }) =>
        user.toString()
      )
      setUsers(usersString)
      console.log('Users:', usersString)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Update the createCollection function to use the collectionCardCount
  const createCollection = async () => {
    if (!collectionName || collectionCardCount <= 0) {
      alert('Please provide a valid collection name and a card count.')
      return
    }

    try {
      setLoading(true)
      console.log('Creating collection:', collectionName, collectionCardCount)
      setStatusMessage(`Creating collection: ${collectionName}...`)
      // use very small gas limit to avoid out of gas error
      await contract.methods
        .createCollection(collectionName, collectionCardCount)
        .send({ from: owner_address })

      setStatusMessage('Collection created successfully!')
      fetchCollections() // Refresh the collection list after creation
    } catch (error) {
      console.error('Error creating collection:', error)
      setStatusMessage('Failed to create collection.')
    } finally {
      setLoading(false)
    }
  }

  const mintCard = async (card: PokemonCard) => {
    if (!userAddress || selectedCollectionId === null || !card.cardNumber) {
      alert('Please select a user and a collection.')
      return
    }

    try {
      setLoading(true)
      setStatusMessage(`Minting ${card.name}...`)

      console.log('selectedCollectionId:', selectedCollectionId)
      console.log('userAddress:', userAddress)
      console.log('card.id:', card.id)
      console.log('card.imageUrl:', card.imageUrl)

      await contract.methods
        .mintAndAssignCard(
          selectedCollectionId,
          userAddress,
          card.id,
          card.cardNumber || 0, // Use the card number if available
          card.imageUrl
        )
        .send({
          from: owner_address,
          // gas: 1000,
        })

      setStatusMessage(`${card.name} minted successfully!`)
    } catch (error) {
      console.error('Error minting card:', error)
      setStatusMessage('Failed to mint card.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('Selected Collection ID:', selectedCollectionId)
  }, [selectedCollectionId])

  // Function to mint multiple selected cards to a user
  const mintMultipleCards = async () => {
    if (!userAddress || selectedCollectionId === null) {
      alert('Please select a user and a collection.')
      return
    }

    try {
      setLoading(true)
      const cardsIds = selectedCards.map(card => card.id)
      const cardNumbers = selectedCards.map(card => card.cardNumber || 0)
      const imageURIs = selectedCards.map(card => card.imageUrl)

      await contract.methods
        .mintAndAssignMultipleCards(
          selectedCollectionId,
          userAddress,
          cardsIds,
          cardNumbers,
          imageURIs
        )
        .send({
          from: owner_address,
          // gas: 1000,
        })

      setStatusMessage(`Minted ${selectedCards.length} cards to ${userAddress}`)
    } catch (error) {
      console.error('Error minting multiple cards:', error)
      setStatusMessage('Failed to mint multiple cards.')
    } finally {
      setLoading(false)
    }
  }

  const createBooster = async () => {
    if (boosterNumber === 0 || !boosterName) {
      alert('Please select a user, provide a booster name, and select cards.')
      return
    }

    try {
      setLoading(true)
      setStatusMessage(
        `Creating booster: ${boosterName} with ${boosterNumber} cards...`
      )

      //  call backend to generate booster
      const response = await axios.get(
        `http://localhost:5000/api/booster/generate/${setId}/${boosterNumber}/${boosterName}`
      )

      const {
        boosterName_res,
        cardIds,
      }: { boosterName_res: string; cardIds: string[] } = response.data

      console.log('Booster Name:', boosterName_res)
      console.log('Card IDs:', cardIds)

      // get the card  Promise<{ name: string; cardIds: string[] , cardNumbers: string[] , cardNames: string[] , cardImages: string[] }> => {

      // Call the contract to create the booster
      await contract.methods
        .createBoosterForPlayer(userAddress, cardIds, boosterName)
        .send({
          from: owner_address,
          // cost 0.01 wei , don't take boosterPrice as input
          value: web3.utils.toWei('0.01', 'ether'),
        })

      setStatusMessage('Booster created successfully!')
    } catch (error) {
      console.error('Error creating booster:', error)
      setStatusMessage('Failed to create booster.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-pokemonBlue">Admin Panel</h2>
      {isOwner ? (
        <>
          {/* Fetch and Refresh Cards */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Fetch Pokémon Cards</h3>
            <div className="flex space-x-2">
              <select
                value={setId}
                onChange={e => setSetId(e.target.value)}
                className="px-4 py-2 border rounded-md w-full"
              >
                <option value="">Select a Set ID</option>
                {setIds.map(id => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
              <button
                className="bg-pokemonBlue text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                onClick={selectRandomSet}
                disabled={loading}
              >
                Random
              </button>
            </div>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded ml-2 hover:bg-red-600 transition duration-300"
              onClick={fetchCards}
              disabled={loading}
            >
              {loading ? 'Fetching...' : 'Fetch Cards'}
            </button>
            {/* <button
              className="bg-red-500 text-white px-4 py-2 rounded ml-2 hover:bg-red-600 transition duration-300"
              onClick={refreshCards}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Cards'}
            </button> */}
          </div>

          {/* Display Cards */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Available Cards</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map(card => (
                <li
                  key={card.id}
                  className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 hover:-rotate-1 hover:shadow-xl relative"
                >
                  <div className="relative">
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-full h-60 object-contain rounded mb-2 border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 hover:opacity-90 transition-opacity duration-300 flex flex-col justify-end p-4 rounded">
                      <span className="text-white text-lg font-semibold">
                        {card.name}
                      </span>
                      <span className="text-gray-300 text-sm">
                        Level: {card.cardNumber}
                      </span>
                      <span className="text-gray-300 text-sm">
                        HP: {card.hp}{' '}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <button
                      className="bg-pokemonBlue text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                      onClick={() => mintCard(card)}
                      disabled={loading}
                    >
                      Mint Card
                    </button>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-pokemonBlue rounded"
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedCards([...selectedCards, card])
                        } else {
                          setSelectedCards(
                            selectedCards.filter(c => c.id !== card.id)
                          )
                        }
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* booster creation  */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Create Booster</h3>
            <input
              type="text"
              placeholder="Booster Name"
              value={boosterName}
              onChange={e => setBoosterName(e.target.value)}
              className="px-4 py-2 border rounded-md w-full mb-2"
            />

            <input
              type="number"
              placeholder="Number of Cards"
              value={boosterNumber}
              onChange={e => setBoosterNumber(Number(e.target.value))}
              className="px-4 py-2 border rounded-md w-full mb-2"
            />

            <button
              className="bg-pokemonBlue text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              onClick={createBooster}
              disabled={loading}
            >
              {loading ? 'Creating Booster...' : 'Create Booster'}
            </button>
          </div>

          {/* Create Collection */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Create a Collection</h3>
            <input
              type="text"
              placeholder="Collection Name"
              value={collectionName}
              onChange={e => setCollectionName(e.target.value)}
              className="px-4 py-2 border rounded-md w-full mb-2"
            />
            <input
              type="number"
              placeholder="Card Count"
              value={collectionCardCount}
              onChange={e => setCollectionCardCount(Number(e.target.value))}
              className="px-4 py-2 border rounded-md w-full mb-2"
            />
            <button
              className="bg-pokemonBlue text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              onClick={createCollection}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Collection'}
            </button>
          </div>

          {/* User Selection for Minting */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select User</h3>
            <select
              value={userAddress}
              onChange={e => setUserAddress(e.target.value)}
              className="px-4 py-2 border rounded-md w-full"
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
            {/* button to refresh userfetch */}
            <button
              className="bg-pokemonBlue text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              onClick={fetchUsers}
              disabled={loading}
            >
              {loading ? 'Fetching...' : 'Fetch Users'}
            </button>
          </div>

          {/* Select Collection for Minting */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Select Collection for Minting
            </h3>
            <select
              value={
                selectedCollectionId !== null
                  ? selectedCollectionId.toString()
                  : ''
              }
              onChange={e => {
                const value = e.target.value
                setSelectedCollectionId(value ? parseInt(value) : null)
              }}
              className="px-4 py-2 border rounded-md w-full"
            >
              <option value="">Select Collection</option>
              {collections.map(collection => (
                <option key={collection.id} value={collection.id.toString()}>
                  {collection.name} - {collection.cardCount} cards
                </option>
              ))}
            </select>
          </div>

          {selectedCards.length > 0 && (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded mt-4 hover:bg-green-600 transition duration-300"
              onClick={mintMultipleCards}
              disabled={loading}
            >
              {loading ? 'Minting...' : `Mint ${selectedCards.length} Cards`}
            </button>
          )}
        </>
      ) : (
        <p className="text-red-500">
          You are not authorized to perform admin actions.
        </p>
      )}
      {statusMessage && <p className="text-gray-700 mt-4">{statusMessage}</p>}
    </div>
  )
}

export default Admin
