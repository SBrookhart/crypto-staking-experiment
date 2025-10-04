// Minimal burner wallet for testnet use.
// - Generates and stores a random private key in localStorage the first time.
// - Connects to Sepolia via a public RPC or your Vercel env var VITE_RPC_URL.

import { Wallet, JsonRpcProvider } from 'ethers';

// Fallback public Sepolia RPC (rate-limited). You can override with VITE_RPC_URL.
const DEFAULT_RPC = 'https://ethereum-sepolia.publicnode.com';

export function getProvider() {
  const rpc = import.meta.env.VITE_RPC_URL || DEFAULT_RPC;
  return new JsonRpcProvider(rpc);
}

const LS_KEY = 'burner_pk_v1';

export function getOrCreateBurnerWallet() {
  let pk = localStorage.getItem(LS_KEY);
  if (!pk) {
    // Never do this on mainnet. Testnet only.
    const wallet = Wallet.createRandom();
    pk = wallet.privateKey;
    localStorage.setItem(LS_KEY, pk);
  }
  const provider = getProvider();
  return new Wallet(pk, provider);
}

export function wipeBurner() {
  localStorage.removeItem(LS_KEY);
}
