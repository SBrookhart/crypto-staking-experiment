# Crypto Staking Vibe Code

This project is a vibe-coded prototype for a simple crypto staking dashboard using React and Solidity.

## Features

- Stake ERC-20 tokens in a smart contract
- View staked balance and pending rewards
- Withdraw staked tokens and rewards
- Connect and interact with MetaMask

## Structure

- `contracts/SimpleStaking.sol`: Solidity smart contract for staking (deploy to Ethereum testnet)
- `src/StakingDashboard.jsx`: React dashboard for interacting with the staking contract

## Deployment

1. Deploy SimpleStaking.sol using Remix to a testnet.
2. Update the contract address and ABI in StakingDashboard.jsx.
3. Push your project to GitHub.
4. Deploy front-end to Vercel, Netlify, or similar cloud service.

## Requirements

- Node.js and npm (for local development)
- MetaMask browser extension (for end-users)
- Ethereum testnet access for deploying smart contract

## Steps

- Clone repository & install dependencies:  
  `npm install`
- Start development server locally:  
  `npm start`

---

## License

MIT
