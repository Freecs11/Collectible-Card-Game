import React, { FC, useEffect, useState } from 'react';
import './NFTInfo.css';
import * as ethereum from '@/lib/ethereum';
import * as main from '@/lib/main';

interface NFTInfoProps {
  wallet: {
    details: ethereum.Details;
    contract: main.Main;
  } | undefined;
}

const NFTInfo: FC<NFTInfoProps> = ({ wallet }) => {
  const [nftsByAddress, setNftsByAddress] = useState<number[]>([]);

  // // TEST FUNCTION
  //   // Function to retrieve all NFTs and their owners from all collections
  //   // returns two arrays: one with NFT IDs and one with their respective owners
  //   function getNFTsAndOwnersFromAllCollections() external view returns (uint256[] memory, address[] memory) {
  
  async function displayNFTsAndOwners() {
  try {
    const result = await wallet.contract.getNFTsAndOwnersFromAllCollections();

    // Log the raw result
    console.log('Raw result:', result);

    // Access the arrays
    const nfts = result[0];
    const owners = result[1];

    // Convert to arrays if necessary
    const nftsArray = Array.isArray(nfts) ? nfts : Object.values(nfts);
    const ownersArray = Array.isArray(owners) ? owners : Object.values(owners);

    // Check that both arrays are the same length
    if (nftsArray.length !== ownersArray.length) {
      console.error('Mismatch between number of NFTs and owners');
      return;
    }

    // Iterate over the arrays
    for (let i = 0; i < nftsArray.length; i++) {
      const nftId = nftsArray[i].toString(); // Convert BigNumber to string
      const ownerAddress = ownersArray[i];
      console.log(`NFT ID: ${nftId} Owner: ${ownerAddress}`);
    }
  } catch (error) {
    console.error('Error fetching NFTs and owners:', error);
  }
}

// displayNFTsAndOwners();


  useEffect(() => {
    if (!wallet) return;

    const fetchNFTs = async () => {
      try {
        const ownerAddress = wallet.details.account;
        // Fetch NFTs owned by the user
        const nfts = await wallet.contract.getNFTsByPlayer(ownerAddress);
        setNftsByAddress(nfts);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      }
    };

    fetchNFTs();
  }, [wallet]);

  if (!wallet) {
    return <div>Loading...</div>;
  }

  const ownerAddress = wallet.details.account;

  return (
    <div className="NFTInfo">
      <h2>NFT Information</h2>
      <p>Owner: {ownerAddress}</p>
      {nftsByAddress.length > 0 ? (
        <ul>
          {nftsByAddress.map((tokenId) => (
            <li key={tokenId}>Token ID: {tokenId}</li>
          ))}
        </ul>
      ) : (
        <p>No NFTs owned.</p>
      )}
      <button onClick={displayNFTsAndOwners}>Get NFTs and Owners from all collections</button>
    </div>
  );
};

export default NFTInfo;
