import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.css';
import * as ethereum from '@/lib/ethereum';
import * as main from '@/lib/main';
import cardABI from '../../contracts/artifacts/src/Card.sol/Card.json';
import { ethers } from 'ethers';


type Canceler = () => void;
const useAffect = (
  asyncEffect: () => Promise<Canceler | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<Canceler | void>();
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncatched error', error));
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current();
        cancelerRef.current = undefined;
      }
    };
  }, dependencies);
};

const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details>()
  const [mainContract, setMainContract] = useState<main.Main>()
  const [cardContract, setCardContract] = useState<ethers.Contract>()

  useAffect(async () => {
    const details_ = await ethereum.connect('metamask')
    if (!details_) return
    setDetails(details_)

    const mainContract_ = await main.init(details_)
    if (!mainContract_) return
    setMainContract(mainContract_)

    // Get the address of the Card contract from the Main contract
    const cardContractAddress = await mainContract_.cardContract()

    // Initialize the Card contract
    const cardContract_ = new ethers.Contract(
      cardContractAddress,
      cardABI.abi,
      details_.provider
    )
    setCardContract(cardContract_)
  }, [])

  return useMemo(() => {
    if (!details || !mainContract || !cardContract) return
    return { details, mainContract, cardContract }
  }, [details, mainContract, cardContract])
}

const fetchNftMetadata = async (tokenId: string) => {
  const response = await fetch(`http://localhost:3001/nft/${tokenId}`);
  return await response.json();
};


export const App = () => {
  const wallet = useWallet()
  const [nfts, setNfts] = useState<{ tokenId: string; name: string; img?: string }[]>([])
  // testing fetch of all NFTs in the contract
  const [allNFTSIDs, setAllNFTSIDs] = useState<{ nftId : string ; ownerid : string }[]>([])

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!wallet) {
        console.log('No wallet')
        return
      }
      const { details, cardContract } = wallet

      // Get the balance of NFTs owned by the user
      const balance = await cardContract.balanceOf(details.account)
      console.log(balance.toString())

      // Fetch all token IDs
      const nftIds = []
      for (let i = 0; i < balance; i++) {
        const tokenId = await cardContract.tokenOfOwnerByIndex(details.account, i) // from the ERC721Enumerable card contract
        nftIds.push(tokenId.toString())
      }

      // Fetch metadata for each NFT from the API
      const nftData = await Promise.all(
        nftIds.map(async (tokenId) => {
          // Fetch metadata from the API
          const response = await fetch(`http://localhost:3001/nft/${tokenId}`)
          const metadata = await response.json()

          // NOT WORKING rn
          console.log(metadata)

          return {
            tokenId,
            ...metadata,
          }
        })
      )

      setNfts(nftData)
    }

    fetchNFTs()
  }, [wallet])

  return (
    <div className={styles.body}>
      <h1>Welcome to Pokémon TCG</h1>
      {wallet ? (
        <div>
          <h2>Your NFTs</h2>
          <ul>
            {nfts.map((nft) => (
              <li key={nft.tokenId}>
                <h3>{nft.name}</h3>
                {nft.img && <img src={nft.img} alt={nft.name} />}
                <p>Token ID: {nft.tokenId}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  )
}
