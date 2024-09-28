import {useCallback, useState} from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import {ethers} from 'ethers';

export function useBlockchainConnection() {

  const [blockChProvider, setBlockChProvider] = useState();
  const [currentNetworkActive, setCurrentNetworkActive] = useState("");
  const [amountLeftInWallet, setAmountLeftInWallet] = useState("");
  const [isTheWalletConnected, setIsTheWalletConnected] = useState(false);
  const [accountConnected, setAccountConnected] = useState("");

  const connectWithInjectedProvider = useCallback(async () => {
 
    const detectedETHProvider = await detectEthereumProvider();
    if(detectedETHProvider != null && detectedETHProvider != undefined) {
      console.log(detectedETHProvider)
      const createdProviderInstance = new ethers.BrowserProvider(detectedETHProvider);
      setBlockChProvider(createdProviderInstance);

      try{
        const userAccounts = await detectedETHProvider.request({ method: 'eth_requestAccounts' });
        if (userAccounts.length > 0) {
          setAccountConnected(userAccounts[0]);
          setIsTheWalletConnected(true);
        }
      }
      catch(error) {
        console.error('Wallet cannnot be connected: ', error);
      }

      const ntwkToBeConnected = await createdProviderInstance.getNetwork();
      setCurrentNetworkActive(ntwkToBeConnected.name);

      detectedETHProvider.on('accountsChanged', (newAcct) => {
        if(newAcct.length > 0) {
          setAccountConnected(newAcct[0]);
        }
      });

      detectedETHProvider.on('chainChanged', async() => {
        const stateOfNetwork = await createdProviderInstance.getNetwork();
        setCurrentNetworkActive(stateOfNetwork.name);

      });
    } else {
      console.error("You don't have Metamask");
    }
  
  }, []);

  const retrieveBal = useCallback(async (address) => {
    if (blockChProvider) {
      const balFromAccount = await blockChProvider.getBalance(address);
      setAmountLeftInWallet(ethers.utils.formatEther(balFromAccount));
    }
  }, [blockChProvider]);

  return {
    blockChProvider,
    accountConnected,
    currentNetworkActive,
    amountLeftInWallet,
    isTheWalletConnected,
    connectWithInjectedProvider,
    retrieveBal,
  };
}