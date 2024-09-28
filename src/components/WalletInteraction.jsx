// src/components/WalletInteraction.tsx
import { useState } from 'react';
import { useBlockchainConnection } from '../hooks/useBlockchainConnection';

function WalletInteraction() {
  const {
    accountConnected,
    currentNetworkActive,
    amountLeftInWallet,
    isTheWalletConnected,
    connectWithInjectedProvider,
    retrieveBal,
  } = useBlockchainConnection();

  const [inputtedAddress, setInputtedAddress] = useState('');

  const handleBalanceFetch = () => {
    if (inputtedAddress) {
      retrieveBal(inputtedAddress);
    }
  };

  return (
    <div className="wallet-container">
      <h1>Blockchain Wallet Connector</h1>
      {isTheWalletConnected ? (
        <div>
          <p>Connected Account: {accountConnected}</p>
          <p>Current Network: {currentNetworkActive}</p>
        </div>
      ) : (
        <button onClick={connectWithInjectedProvider}>Connect Wallet</button>
      )}

      <div className="balance-section">
        <h2>Check Address Balance</h2>
        <input
          type="text"
          value={inputtedAddress}
          onChange={(e) => setInputtedAddress(e.target.value)}
          placeholder="Enter Ethereum address"
        />
        <button onClick={handleBalanceFetch}>Fetch Balance</button>
        {amountLeftInWallet && (
          <p>Balance: {amountLeftInWallet} ETH</p>
        )}
      </div>
    </div>
  );
};

export default WalletInteraction;
