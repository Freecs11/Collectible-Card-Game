import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './styles.module.css'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'
import NFTInfo from './components/NFTInfo/NFTInfo'
import Header from './components/Header/Header'
import Admin from './components/Admin/Admin'
import { ethers } from 'ethers'
import Web3 from 'web3'

const useAffect = (
  asyncEffect: () => Promise<(() => void) | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<(() => void) | void>()
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncatched error', error))
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

// Function to register user using the admin account
const registerUserAsAdmin = async (abi: any, userAddress: any) => {
  try {
    // contract address
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const owner_address = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
    const web3 = new Web3('http://localhost:8545')

    let contractAbi = abi
    let contract = new web3.eth.Contract(contractAbi, contractAddress)

    // Call the registerUser function
    const tx = contract.methods.registerUser(userAddress)

    // Send the transaction w 0 gas
    const receipt = await tx.send({
      from: owner_address,
      gas: 0,
    })

    console.log('User registered:', userAddress)
    console.log('Transaction receipt:', receipt)
  } catch (error) {
    console.error('Error registering user:', error)
  }
}

export const App = () => {
  const wallet = useWallet()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [userRegistered, setUserRegistered] = useState<boolean>(false)

  const [nft, setNFT] = useState<number | null>(null)

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

  // useEffect(() => {
  //   if (!wallet) return;

  //   const fetchTotalCollections = async () => {
  //     try {
  //       const totalCollections = await wallet.contract.getTotalCollections();
  //       console.log('Total collections:', totalCollections.toNumber());
  //       setNFT(totalCollections.toNumber()); // Convert BigNumber to number
  //     } catch (error) {
  //       console.error('Error fetching total collections:', error);
  //     }
  //   };

  //   fetchTotalCollections();
  // }, [wallet]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pokemonBlue to-lightYellow text-gray-900 font-sans">
      <Header isAdmin={isAdmin} onLogin={setIsAdmin} />
      <main className="p-6 container mx-auto">
        {/* loading until user register and then remove loading */}
        {userRegistered ? (
          <div className="text-center text-2xl font-bold">
            {/* User registered successfully */}
          </div>
        ) : (
          <div className="text-center text-2xl font-bold">Loading...</div>
        )}

        {isAdmin && wallet?.contract && wallet.details ? (
          // const Admin: FC<AdminProps> = ({ contractAddress, provider, adminPrivateKey }) => {
          <Admin />
        ) : (
          wallet && <NFTInfo wallet={wallet} />
        )}
      </main>
    </div>
  )
}
