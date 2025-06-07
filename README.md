# SimpleStorage DApp

A decentralized application (DApp) for interacting with the SimpleStorage smart contract on the Sepolia testnet. This application allows users to store and retrieve messages, deposit and withdraw ETH, and check the contract's balance.

## Features

- **Wallet Connection**
  - MetaMask integration for connecting to Ethereum
  - Display of connected account address
  - Network detection and switching to Sepolia

- **Message Storage**
  - Input field to write messages
  - Button to store messages on-chain
  - Button to retrieve and display stored messages

- **ETH Operations**
  - Input field to specify ETH amount for deposits
  - Deposit button to send ETH to the contract
  - Withdraw button (only visible to contract owner)
  - Display of contract's ETH balance

- **Status Indicators**
  - Transaction status display (loading, success, error)
  - Network status warnings
  - MetaMask installation check

## Technologies Used

- **Frontend**: React.js with Vite
- **Blockchain Interaction**: ethers.js (v5.7.2)
- **Network**: Sepolia Testnet
- **Wallet**: MetaMask

## Project Structure

```
eth-dapp/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── contract/
│   │   └── config.js         # Contract ABI and address
│   ├── utils/
│   │   └── ethereum.js       # Ethereum utility functions
│   ├── App.jsx               # Main application component
│   ├── App.css               # Default Vite styling
│   ├── DApp.css              # DApp-specific styling
│   ├── index.css             # Global styles
│   └── main.jsx              # Application entry point
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Prerequisites

- Node.js and npm installed
- MetaMask browser extension installed
- Some Sepolia ETH for testing (can be obtained from a Sepolia faucet)

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd eth-dapp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Update the contract address:
   - Open `src/contract/config.js`
   - Replace the mock address with your deployed contract address on Sepolia

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to <http://localhost:5173>

## Using the DApp

1. **Connect Your Wallet**
   - Click the "Connect Wallet" button
   - Approve the connection request in MetaMask
   - Ensure you're connected to the Sepolia testnet

2. **Store a Message**
   - Enter a message in the input field
   - Click "Store Message"
   - Approve the transaction in MetaMask
   - Wait for the transaction to be confirmed

3. **Retrieve a Message**
   - Click "Get Message"
   - The stored message will be displayed below

4. **Deposit ETH**
   - Enter the amount of ETH to deposit
   - Click "Deposit ETH"
   - Approve the transaction in MetaMask
   - The contract balance will update after confirmation

5. **Withdraw ETH (Owner Only)**
   - If you're the contract owner, a "Withdraw ETH" button will be visible
   - Click the button to withdraw all ETH from the contract
   - Approve the transaction in MetaMask

## Smart Contract Functions

The DApp interacts with the following functions of the SimpleStorage contract:

- `storeMessage(string _message)`: Stores a message on-chain
- `getMessage()`: Returns the stored message
- `deposit()`: Allows users to send ETH to the contract (payable)
- `withdraw()`: Allows the contract owner to withdraw all ETH
- `getBalance()`: Returns the contract's ETH balance
- `owner()`: Returns the address of the contract owner

## Development

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## License

[MIT](LICENSE)
