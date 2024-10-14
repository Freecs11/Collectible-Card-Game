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
  const [nftsByAddress, setNftsByAddress] = useState<string[]>([]);

  async function displayNFTsAndOwners() {
    try {
      const result = await wallet.contract.getNFTsAndOwnersFromAllCollections();

      // Access the arrays
      const nfts = result[0];
      const owners = result[1];

      // Convert to arrays
      const nftsArray = nfts.map((nft) => nft.toString());
      const ownersArray = owners;

      // Iterate over the arrays
      for (let i = 0; i < nftsArray.length; i++) {
        console.log(`NFT ID: ${nftsArray[i]} Owner: ${ownersArray[i]}`);
      }
    } catch (error) {
      console.error('Error fetching NFTs and owners:', error);
    }
  }

  useEffect(() => {
    if (!wallet) return;

    const fetchNFTs = async () => {
      try {
        const ownerAddress = wallet.details.account;
        // Fetch NFTs owned by the user
        const nfts = await wallet.contract.getNFTsByPlayer(ownerAddress);

        // Convert BigNumbers to strings
        const nftIds = nfts.map((nft) => nft.toString());

        setNftsByAddress(nftIds);
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
