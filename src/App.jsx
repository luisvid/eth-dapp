import { useState, useEffect } from 'react';
import './DApp.css';
import {
  isMetaMaskInstalled,
  connectWallet,
  checkNetwork,
  switchToSepolia,
  getMessage,
  storeMessage,
  deposit,
  withdraw,
  getBalance,
  getContractOwner,
  listenForAccountChanges,
  listenForNetworkChanges
} from './utils/ethereum';

// The main App component for the DApp
// This component handles the user interface and interactions with the blockchain.
function App() {
  // State variables
  // These variables store the current state of the application, such as the connected account, network status, and contract data.
  const [account, setAccount] = useState(null); // Stores the connected wallet address
  const [isOwner, setIsOwner] = useState(false); // Indicates if the connected account is the contract owner
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false); // Checks if the user is on the Sepolia network
  const [message, setMessage] = useState(''); // Stores the input message to be sent to the contract
  const [storedMessage, setStoredMessage] = useState(''); // Stores the message retrieved from the contract
  const [depositAmount, setDepositAmount] = useState(''); // Stores the ETH amount to deposit
  const [contractBalance, setContractBalance] = useState('0'); // Stores the contract's ETH balance
  const [status, setStatus] = useState({ type: '', message: '' }); // Displays status messages to the user
  const [loading, setLoading] = useState(false); // Indicates if an operation is in progress

  // useEffect hook
  // This hook runs when the component is mounted and initializes the DApp.
  useEffect(() => {
    const init = async () => {
      if (!isMetaMaskInstalled()) {
        // If MetaMask is not installed, show an error message.
        setStatus({
          type: 'error',
          message: 'MetaMask is not installed. Please install MetaMask to use this DApp.'
        });
        return;
      }

      try {
        // Check if the wallet is already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          // Check if the user is on the Sepolia network
          const onSepolia = await checkNetwork();
          setIsCorrectNetwork(onSepolia);
          
          if (onSepolia) {
            // Get the contract owner and check if the connected account is the owner
            const owner = await getContractOwner();
            setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
            
            // Get the contract's balance
            await updateContractBalance();
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setStatus({
          type: 'error',
          message: `Initialization failed: ${error.message}`
        });
      }
    };

    init();

    // Set up event listeners for account and network changes
    listenForAccountChanges(handleAccountChange);
    listenForNetworkChanges(handleNetworkChange);

    // Cleanup event listeners when the component is unmounted
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
        window.ethereum.removeListener('chainChanged', handleNetworkChange);
      }
    };
  }, []);

  // Handle account change
  // This function updates the state when the connected wallet account changes.
  const handleAccountChange = async (newAccount) => {
    setAccount(newAccount);
    
    if (newAccount && isCorrectNetwork) {
      const owner = await getContractOwner();
      setIsOwner(newAccount.toLowerCase() === owner.toLowerCase());
      await updateContractBalance();
      setStatus({ type: '', message: '' });
    } else {
      setIsOwner(false);
    }
  };

  // Handle network change
  // This function updates the state when the connected network changes.
  const handleNetworkChange = async (isSepolia) => {
    setIsCorrectNetwork(isSepolia);
    
    if (isSepolia && account) {
      const owner = await getContractOwner();
      setIsOwner(account.toLowerCase() === owner.toLowerCase());
      await updateContractBalance();
      setStatus({ type: '', message: '' });
    } else {
      setIsOwner(false);
    }
  };

  // Connect wallet
  // This function connects the user's wallet to the DApp.
  const handleConnectWallet = async () => {
    setLoading(true);
    setStatus({ type: 'loading', message: 'Connecting to wallet...' });
    
    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      const onSepolia = await checkNetwork();
      setIsCorrectNetwork(onSepolia);
      
      if (onSepolia) {
        const owner = await getContractOwner();
        setIsOwner(connectedAccount.toLowerCase() === owner.toLowerCase());
        await updateContractBalance();
        setStatus({ type: 'success', message: 'Wallet connected successfully!' });
      } else {
        setStatus({
          type: 'error',
          message: 'Please switch to the Sepolia network to use this DApp.'
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      setStatus({
        type: 'error',
        message: `Failed to connect wallet: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Switch to Sepolia network
  // This function switches the user's wallet to the Sepolia testnet.
  const handleSwitchNetwork = async () => {
    setLoading(true);
    setStatus({ type: 'loading', message: 'Switching to Sepolia network...' });
    
    try {
      await switchToSepolia();
      setIsCorrectNetwork(true);
      
      if (account) {
        const owner = await getContractOwner();
        setIsOwner(account.toLowerCase() === owner.toLowerCase());
        await updateContractBalance();
      }
      setStatus({ type: 'success', message: 'Switched to Sepolia network successfully!' });
    } catch (error) {
      console.error('Network switch error:', error);
      setStatus({
        type: 'error',
        message: `Failed to switch network: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Update contract balance
  // This function retrieves the current balance of the smart contract.
  const updateContractBalance = async () => {
    try {
      const balance = await getBalance();
      setContractBalance(balance);
    } catch (error) {
      console.error('Balance update error:', error);
    }
  };

  // Store message
  // This function sends a message to the smart contract.
  const handleStoreMessage = async () => {
    if (!message.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter a message to store.'
      });
      return;
    }
    
    setLoading(true);
    setStatus({ type: 'loading', message: 'Storing message...' });
    
    try {
      await storeMessage(message);
      setStatus({ type: 'success', message: 'Message stored successfully!' });
      setMessage('');
    } catch (error) {
      console.error('Store message error:', error);
      setStatus({
        type: 'error',
        message: `Failed to store message: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Get message
  // This function retrieves the stored message from the smart contract.
  const handleGetMessage = async () => {
    setLoading(true);
    setStatus({ type: 'loading', message: 'Retrieving message...' });
    
    try {
      const retrievedMessage = await getMessage();
      setStoredMessage(retrievedMessage);
      setStatus({ type: 'success', message: 'Message retrieved successfully!' });
    } catch (error) {
      console.error('Get message error:', error);
      setStatus({
        type: 'error',
        message: `Failed to retrieve message: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Deposit ETH
  // This function sends ETH to the smart contract.
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid amount to deposit.'
      });
      return;
    }
    
    setLoading(true);
    setStatus({ type: 'loading', message: 'Depositing ETH...' });
    
    try {
      await deposit(depositAmount);
      await updateContractBalance();
      setStatus({ type: 'success', message: 'ETH deposited successfully!' });
      setDepositAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
      setStatus({
        type: 'error',
        message: `Failed to deposit ETH: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Withdraw ETH
  // This function withdraws all ETH from the smart contract (owner only).
  const handleWithdraw = async () => {
    setLoading(true);
    setStatus({ type: 'loading', message: 'Withdrawing ETH...' });
    
    try {
      await withdraw();
      await updateContractBalance();
      setStatus({ type: 'success', message: 'ETH withdrawn successfully!' });
    } catch (error) {
      console.error('Withdraw error:', error);
      setStatus({
        type: 'error',
        message: `Failed to withdraw ETH: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Format account address for display
  // This function shortens the wallet address for better readability.
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Render the DApp's user interface
  return (
    <div className="dapp-container">
      <header className="dapp-header">
        <h1 className="dapp-title">SimpleStorage DApp</h1>
        <p className="dapp-subtitle">Interact with the SimpleStorage contract on Sepolia testnet</p>
      </header>

      {/* Wallet Connection Section */}
      <div className="wallet-info">
        {account ? (
          <div className="wallet-address">
            Connected: {formatAddress(account)}
          </div>
        ) : (
          <div>Not connected</div>
        )}
        
        {!account && (
          <button 
            className="connect-button" 
            onClick={handleConnectWallet}
            disabled={loading}
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Network Warning Section */}
      {account && !isCorrectNetwork && (
        <div className="network-warning">
          <div>Please switch to the Sepolia network to use this DApp.</div>
          <button 
            className="switch-network-button" 
            onClick={handleSwitchNetwork}
            disabled={loading}
          >
            Switch to Sepolia
          </button>
        </div>
      )}

      {/* Main DApp Content Section */}
      {account && isCorrectNetwork && (
        <>
          {/* Message Storage Section */}
          <section className="dapp-section">
            <h2 className="section-title">Message Storage</h2>
            
            <div className="input-group">
              <input
                type="text"
                className="input-field"
                placeholder="Enter a message to store"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
              />
              <button 
                className="action-button" 
                onClick={handleStoreMessage}
                disabled={loading}
              >
                Store Message
              </button>
            </div>
            
            <div className="input-group">
              <button 
                className="action-button" 
                onClick={handleGetMessage}
                disabled={loading}
              >
                Get Message
              </button>
            </div>
            
            <div className="message-display">
              {storedMessage || "No message retrieved yet"}
            </div>
          </section>

          {/* ETH Deposit Section */}
          <section className="dapp-section">
            <h2 className="section-title">ETH Operations</h2>
            
            <div className="input-group">
              <input
                type="number"
                step="0.001"
                min="0"
                className="input-field"
                placeholder="Enter ETH amount to deposit"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={loading}
              />
              <button 
                className="action-button" 
                onClick={handleDeposit}
                disabled={loading}
              >
                Deposit ETH
              </button>
            </div>
            
            {isOwner && (
              <div className="input-group">
                <button 
                  className="action-button withdraw-button" 
                  onClick={handleWithdraw}
                  disabled={loading}
                >
                  Withdraw ETH (Owner Only)
                </button>
              </div>
            )}
            
            <div className="balance-display">
              Contract Balance: {contractBalance} ETH
            </div>
          </section>
        </>
      )}

      {/* Status Messages Section */}
      {status.message && (
        <div className={`status-container status-${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}

export default App;
