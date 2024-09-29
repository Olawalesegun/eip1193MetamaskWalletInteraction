import {useCallback, useState} from 'react';
// I actually need this to confirm thatMetamask is injected into my Browser
import detectEthereumProvider from '@metamask/detect-provider';
import {ethers} from 'ethers';

export function useBlockchainConnection() {

  const [blockChProvider, setBlockChProvider] = useState();
  const [currentNetworkActive, setCurrentNetworkActive] = useState("");
  const [amountLeftInWallet, setAmountLeftInWallet] = useState("");
  const [isTheWalletConnected, setIsTheWalletConnected] = useState(false);
  const [accountConnected, setAccountConnected] = useState("");

  const connectWithInjectedProvider = useCallback(async () => {
    let createdProviderInstance;

    const detectedETHProvider = await detectEthereumProvider();

    if(detectedETHProvider != null && detectedETHProvider != undefined) {
      console.log(detectedETHProvider)
      createdProviderInstance = new ethers.BrowserProvider(detectedETHProvider);
      if(createdProviderInstance){
        setBlockChProvider(createdProviderInstance);
      }else{
        console.log("there was some error with BrowserProvider");
      }
      
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
      console.log("The network connected is", ntwkToBeConnected);
      if(ntwkToBeConnected){
        setCurrentNetworkActive(ntwkToBeConnected.name);
      } else{
        console.log("There was an error in getting the network");
      }

      detectedETHProvider.on('accountsChanged', handleChangeOfAccount);

      detectedETHProvider.on('chainChanged', handleChangeOfChain);
    } else {
      console.error("You don't have Metamask");
    }
    async function handleChangeOfChain() {
      const stateOfNetwork = await createdProviderInstance.getNetwork();
      setCurrentNetworkActive(stateOfNetwork.name);
    }

    function handleChangeOfAccount(newAcct) {
      if(newAcct.length > 0) {
        setAccountConnected(newAcct[0]);
      }
    }

    return () => {
      if (detectedETHProvider) {
        detectedETHProvider.removeListener('accountsChanged', handleChangeOfAccount);
        detectedETHProvider.removeListener('chainChanged', handleChangeOfChain);
      }
    };
  }, []);

  
  const retrieveBal = useCallback(async (address) => {
    if (blockChProvider) {
      try{
        const balFromAccount = await blockChProvider.getBalance(address);
        setAmountLeftInWallet(ethers.utils.formatEther(balFromAccount));  
      } catch(err){
        console.error('There was a problem retrieving balance', err);
      }
      
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