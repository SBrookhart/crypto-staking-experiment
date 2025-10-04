import React, { useEffect, useMemo, useState } from 'react';
import {
  Contract,
  formatUnits,
  parseUnits
} from 'ethers';

// ========= 1) FILL THESE IN =========
const stakingContractAddress = "PASTE_YOUR_DEPLOYED_STAKING_ADDRESS_HERE";

// Paste the ABI array from Remix (SimpleStaking ABI)
const stakingContractABI = [
  // PASTE YOUR ABI ARRAY HERE
];

// Minimal ERC-20 ABI for approve/balance/decimals
const erc20ABI = [
  { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
];

export default function StakingDashboard({ burnerWallet }) {
  const [tokenAddress, setTokenAddress] = useState('PASTE_YOUR_TEST_ERC20_ADDRESS_HERE');

  const [staking, setStaking] = useState(null);
  const [token, setToken] = useState(null);
  const [decimals, setDecimals] = useState(18);

  const [stakeInput, setStakeInput] = useState('');
  const [withdrawInput, setWithdrawInput] = useState('');
  const [approveInput, setApproveInput] = useState('');

  const [userStake, setUserStake] = useState('0');
  const [pendingRewards, setPendingRewards] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');

  // Fixed to Sepolia by RPC; no extension needed.
  const shortAddr = useMemo(() => burnerWallet.address.slice(0, 6) + '…' + burnerWallet.address.slice(-4), [burnerWallet.address]);

  useEffect(() => {
    if (!burnerWallet || !tokenAddress) return;
    const stakingC = new Contract(stakingContractAddress, stakingContractABI, burnerWallet);
    const tokenC = new Contract(tokenAddress, erc20ABI, burnerWallet);
    setStaking(stakingC);
    setToken(tokenC);
  }, [burnerWallet, tokenAddress]);

  useEffect(() => {
    async function boot() {
      if (!token) return;
      try {
        const d = await token.decimals();
        setDecimals(d);
      } catch {
        setDecimals(18);
      }
      refresh();
    }
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, staking]);

  async function refresh() {
    if (!staking || !token) return;
    try {
      const [stakeBN, rewardsBN, totalBN, balBN] = await Promise.all([
        staking.userStake(burnerWallet.address),
        staking.earned(burnerWallet.address),
        staking.totalStaked(),
        token.balanceOf(burnerWallet.address)
      ]);
      setUserStake(formatUnits(stakeBN, decimals));
      setPendingRewards(formatUnits(rewardsBN, decimals));
      setTotalStaked(formatUnits(totalBN, decimals));
      setTokenBalance(formatUnits(balBN, decimals));
    } catch (e) {
      console.error(e);
      alert('Read failed. Check addresses/ABI and RPC.');
    }
  }

  async function doApprove() {
    if (!token) return;
    try {
      const amt = parseUnits(approveInput || '0', decimals);
      const tx = await token.approve(stakingContractAddress, amt);
      await tx.wait();
      setApproveInput('');
      alert('Approved!');
    } catch (e) {
      alert(e?.shortMessage || e?.message || 'Approve failed');
    }
  }

  async function doStake() {
    if (!staking) return;
    try {
      const amt = parseUnits(stakeInput || '0', decimals);
      const tx = await staking.stake(amt);
      await tx.wait();
      setStakeInput('');
      await refresh();
      alert('Staked!');
    } catch (e) {
      alert(e?.shortMessage || e?.message || 'Stake failed');
    }
  }

  async function doWithdraw() {
    if (!staking) return;
    try {
      const amt = parseUnits(withdrawInput || '0', decimals);
      const tx = await staking.withdraw(amt);
      await tx.wait();
      setWithdrawInput('');
      await refresh();
      alert('Withdrawn!');
    } catch (e) {
      alert(e?.shortMessage || e?.message || 'Withdraw failed');
    }
  }

  async function doClaim() {
    if (!staking) return;
    try {
      const tx = await staking.claimRewards();
      await tx.wait();
      await refresh();
      alert('Rewards claimed!');
    } catch (e) {
      alert(e?.shortMessage || e?.message || 'Claim failed');
    }
  }

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #ddd', borderRadius: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <strong>Burner Wallet:</strong> {shortAddr}
      </div>

      <div style={row}>
        <div style={card}>
          <div><strong>Token Address (ERC-20):</strong></div>
          <input
            style={input}
            value={tokenAddress}
            onChange={e => setTokenAddress(e.target.value)}
            placeholder="0xYourTestTokenOnSepolia"
          />
          <div style={{ color: '#666' }}>Balance: {tokenBalance}</div>

          <div style={{ marginTop: 8 }}>
            <strong>Approve</strong> (allow staking contract to spend your tokens)
            <input
              style={input}
              placeholder="Amount to approve"
              value={approveInput}
              onChange={e => setApproveInput(e.target.value)}
            />
            <button style={btn} onClick={doApprove}>Approve</button>
          </div>
        </div>

        <div style={card}>
          <div><strong>Your Staked:</strong> {userStake}</div>
          <div><strong>Pending Rewards:</strong> {pendingRewards}</div>
          <div><strong>Total Staked in Contract:</strong> {totalStaked}</div>
          <button style={btn} onClick={refresh}>Refresh</button>
        </div>

        <div style={card}>
          <div><strong>Stake</strong></div>
          <input
            placeholder="Amount"
            value={stakeInput}
            onChange={e => setStakeInput(e.target.value)}
            style={input}
          />
          <button onClick={doStake} style={btn}>Stake</button>
        </div>

        <div style={card}>
          <div><strong>Withdraw</strong></div>
          <input
            placeholder="Amount"
            value={withdrawInput}
            onChange={e => setWithdrawInput(e.target.value)}
            style={input}
          />
          <button onClick={doWithdraw} style={btn}>Withdraw</button>
        </div>

        <div style={card}>
          <div><strong>Rewards</strong></div>
          <button onClick={doClaim} style={btn}>Claim Rewards</button>
        </div>
      </div>

      <p style={{ color: '#666', marginTop: 12 }}>
        Flow: 1) Fund burner with Sepolia ETH (gas) and a test ERC-20. 2) Approve the staking contract. 3) Stake. 4) Claim later.
        Owner of the staking contract must also deposit reward tokens via <code>fundRewards()</code> (in Remix or another wallet you control).
      </p>
    </div>
  );
}

const row = { display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', alignItems: 'start' };
const card = { border: '1px solid #eee', borderRadius: 10, padding: 12, background: '#fafafa' };
const btn = { padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', background: '#fff' };
const input = { padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', margin: '6px 0' };
