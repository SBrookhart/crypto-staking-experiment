import React, { useMemo, useState } from 'react';
import StakingDashboard from './StakingDashboard.jsx';
import { getOrCreateBurnerWallet, wipeBurner } from './burner.js';

export default function App() {
  const [walletVersion, setWalletVersion] = useState(0);

  // Recreate (or load) the burner whenever walletVersion changes
  const wallet = useMemo(() => getOrCreateBurnerWallet(), [walletVersion]);

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); alert('Copied!'); } catch {}
  }

  return (
    <div style={{ maxWidth: 880, margin: '24px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Crypto Staking Vibe Code (Burner Wallet)</h1>
      <p style={{ color: '#555' }}>
        This app uses a <strong>testnet-only burner wallet</strong> stored in your browser.
        Fund it with Sepolia ETH and a test ERC-20, then stake. Do not use for real assets.
      </p>

      <div style={topCard}>
        <div><strong>Address:</strong> {wallet.address}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={btn} onClick={() => copy(wallet.address)}>Copy Address</button>
          <button
            style={btn}
            onClick={() => {
              // Show the private key so you can back it up in case you clear cache (TESTNET ONLY).
              alert(`TESTNET PRIVATE KEY:\n\n${wallet.privateKey}\n\nNever use on mainnet.`);
            }}
          >
            Show Private Key
          </button>
          <button
            style={danger}
            onClick={() => {
              if (confirm('Wipe burner wallet from this browser? You will lose access unless you saved the private key.')) {
                wipeBurner();
                setWalletVersion(v => v + 1);
              }
            }}
          >
            Wipe Burner
          </button>
        </div>
        <div style={{ color: '#666', marginTop: 8 }}>
          Fund this address with <strong>Sepolia ETH</strong> (for gas) using a faucet. Then acquire/mint a test ERC-20 and send some to this address.
        </div>
      </div>

      <StakingDashboard burnerWallet={wallet} />

      <footer style={{ marginTop: 24, color: '#777', fontSize: 12 }}>
        © Your experiment. Testnet only. Never import this burner on mainnet.
      </footer>
    </div>
  );
}

const topCard = { border: '1px solid #eee', borderRadius: 10, padding: 12, background: '#fafafa' };
const btn = { padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', background: '#fff' };
const danger = { ...btn, borderColor: '#f3b1b1', background: '#ffecec' };
