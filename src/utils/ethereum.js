import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract/config';

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return window.ethereum !== undefined;
};

// Request account access from MetaMask
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    throw new Error(`Failed to connect to wallet: ${error.message}`);
  }
};

// Check if connected to Sepolia network
export const checkNetwork = async () => {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    // Sepolia chain ID is 0xaa36a7 (11155111 in decimal)
    return chainId === '0xaa36a7';
  } catch (error) {
    throw new Error(`Failed to check network: ${error.message}`);
  }
};

// Switch to Sepolia network
export const switchToSepolia = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
    });
    return true;
  } catch (error) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        throw new Error(`Failed to add Sepolia network: ${addError.message}`);
      }
    }
    throw new Error(`Failed to switch to Sepolia network: ${error.message}`);
  }
};

// Get contract instance
export const getContract = async (withSigner = false) => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    if (withSigner) {
      const signer = provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  } catch (error) {
    throw new Error(`Failed to get contract: ${error.message}`);
  }
};

// Get contract owner
export const getContractOwner = async () => {
  try {
    const contract = await getContract();
    return await contract.owner();
  } catch (error) {
    throw new Error(`Failed to get contract owner: ${error.message}`);
  }
};

// Store message
export const storeMessage = async (message) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.storeMessage(message);
    return await tx.wait();
  } catch (error) {
    throw new Error(`Failed to store message: ${error.message}`);
  }
};

// Get message
export const getMessage = async () => {
  try {
    const contract = await getContract();
    return await contract.getMessage();
  } catch (error) {
    throw new Error(`Failed to get message: ${error.message}`);
  }
};

// Deposit ETH
export const deposit = async (amount) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.deposit({
      value: ethers.utils.parseEther(amount.toString())
    });
    return await tx.wait();
  } catch (error) {
    throw new Error(`Failed to deposit ETH: ${error.message}`);
  }
};

// Withdraw ETH
export const withdraw = async () => {
  try {
    const contract = await getContract(true);
    const tx = await contract.withdraw();
    return await tx.wait();
  } catch (error) {
    throw new Error(`Failed to withdraw ETH: ${error.message}`);
  }
};

// Get contract balance
export const getBalance = async () => {
  try {
    const contract = await getContract();
    const balance = await contract.getBalance();
    return ethers.utils.formatEther(balance);
  } catch (error) {
    throw new Error(`Failed to get balance: ${error.message}`);
  }
};

// Listen for account changes
export const listenForAccountChanges = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      callback(accounts[0] || null);
    });
  }
};

// Listen for network changes
export const listenForNetworkChanges = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
      callback(chainId === '0xaa36a7'); // Check if Sepolia
    });
  }
};
