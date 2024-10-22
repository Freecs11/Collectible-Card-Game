// App.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'
import Header from './components/Header/Header'
import Admin from './components/Admin/Admin'
import Boosters from './components/Boosters'
import Collections from './components/Collections'
import Navbar from './components/Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Web3 from 'web3' // Import Web3
import { ethers } from 'ethers'
import Home from './components/Home'

const useAffect = (
  asyncEffect: () => Promise<(() => void) | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<(() => void) | void>()
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncaught error', error))
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current()
        cancelerRef.current = undefined
      }
    }
  }, dependencies)
}

const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details>()
  const [contract, setContract] = useState<main.Main>()
  useAffect(async () => {
    const details_ = await ethereum.connect('metamask')
    if (!details_) return
    setDetails(details_)
    const contract_ = await main.init(details_)
    if (!contract_) return
    setContract(contract_)
  }, [])
  return useMemo(() => {
    if (!details || !contract) return
    return { details, contract }
  }, [details, contract])
}

// Function to register user
const registerUserAsAdmin = async (abi: any, userAddress: any) => {
  try {
    // contract address
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const web3 = new Web3('http://localhost:8545')

    let contractAbi = main.myAbi()
    const contract = new web3.eth.Contract(contractAbi, contractAddress)

    await contract.methods.registerUser(userAddress).send({ from: userAddress })

    console.log('User registered:', userAddress)
  } catch (error) {
    console.error('Error registering user:', error)
  }
}

export const App = () => {
  const wallet = useWallet()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [userRegistered, setUserRegistered] = useState<boolean>(false)

  useEffect(() => {
    if (!wallet) return

    const registerUser = async () => {
      try {
        const userAddress = wallet.details.account
        await registerUserAsAdmin(main.myAbi(), userAddress)

        setUserRegistered(true)
      } catch (error) {
        console.error('Error registering user:', error)
      }
    }

    registerUser()
  }, [wallet])

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-pokemonBlue to-lightYellow text-gray-900 font-sans">
        <Header isAdmin={isAdmin} onLogin={setIsAdmin} />
        <Navbar isAdmin={isAdmin} />
        <main className="p-6 container mx-auto">
          {userRegistered ? (
            <Routes>
              <Route
                path="/"
                element={
                  wallet ? <Home wallet={wallet} /> : <div>Loading...</div>
                }
              />
              <Route
                path="/collections"
                element={wallet && <Collections wallet={wallet} />}
              />
              <Route
                path="/boosters"
                element={wallet && <Boosters wallet={wallet} />}
              />
              {isAdmin && <Route path="/admin" element={<Admin />} />}
              <Route
                path="/marketplace"
                element={
                  <div>
                    <h2 className="text-2xl font-bold">
                      Marketplace Coming Soon!
                    </h2>
                  </div>
                }
              />
            </Routes>
          ) : (
            <div className="text-center text-2xl font-bold">Loading...</div>
          )}
        </main>
      </div>
    </Router>
  )
}
