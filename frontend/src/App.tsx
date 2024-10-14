import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.css';
import * as ethereum from '@/lib/ethereum';
import * as main from '@/lib/main';
import NFTInfo from './components/NFTInfo/NFTInfo';

type Canceler = () => void;
const useAffect = (
  asyncEffect: () => Promise<Canceler | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<Canceler | void>();
  useEffect(() => {
    asyncEffect()
      .then((canceler) => (cancelerRef.current = canceler))
      .catch((error) => console.warn('Uncatched error', error));
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current();
        cancelerRef.current = undefined;
      }
    };
  }, dependencies);
};

const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details>();
  const [contract, setContract] = useState<main.Main>();
  useAffect(async () => {
    const details_ = await ethereum.connect('metamask');
    if (!details_) return;
    setDetails(details_);
    const contract_ = await main.init(details_);
    if (!contract_) return;
    setContract(contract_);
  }, []);
  return useMemo(() => {
    if (!details || !contract) return;
    return { details, contract };
  }, [details, contract]);
};

export const App = () => {
  const wallet = useWallet();


  const [nft, setNFT] = useState<number | null>(null);
  const [owner, setOwner] = useState<string | undefined>();

  useEffect(() => {
    if (!wallet) return;

    const fetchTotalCollections = async () => {
      try {
        setOwner(wallet.details.account);
        const totalCollections = await wallet.contract.getTotalCollections();
        setNFT(totalCollections.toNumber()); // Convert BigNumber to number
      } catch (error) {
        console.error('Error fetching total collections:', error);
      }
    };

    fetchTotalCollections();
  }, [wallet]);




  return (
    <div className={styles.body}>
      <h1>Welcome to Pokémon TCG</h1>
      <NFTInfo wallet={wallet} />
    </div>
  );
};
