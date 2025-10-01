import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Replace these with your deployed contract info
const stakingContractAddress = 'REPLACE_WITH_CONTRACT_ADDRESS';
const stakingContractABI = [
  // Minimal ABI needed to interact with the contract
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function pendingReward(address user) external view returns (uint256)",
  "function stakedBalance(address user) external view returns (uint256)",
  "function stakingToken() external view returns (address)"
];

const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

function StakingDashboard() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [stakedBalance, setStakedBalance] = useState('0');
  const [pendingRewards, setPendingRewards] = useState('0');
  const [decimals, setDecimals] = useState(18);

  useEffect(() => {
    if (contract && account) {
      updateBalances();
    }
  }, [contract, account]);

  async function connectWallet() {
    if (window.ethereum) {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const sign = prov.getSigner();
      const userAddr = await sign.getAddress();
      setProvider(prov);
      setSigner(sign);
      setAccount(userAddr);
      const stakingCont = new ethers.Contract(stakingContractAddress, stakingContractABI, sign);
      setContract(stakingCont);
      const tokenAddr = await stakingCont.stakingToken();
      const tokenCont = new ethers.Contract(tokenAddr, erc20ABI, sign);
      setTokenContract(tokenCont);
      const dec = await tokenCont.decimals();
      setDecimals(dec);
    } else {
      alert("Please install MetaMask!");
    }
  }

  async function updateBalances() {
    try {
      const staked = await contract.stakedBalance(account);
      const pending = await contract.pendingReward(account);
      setStakedBalance(ethers.utils.formatUnits(staked, decimals));
      setPendingRewards(ethers.utils.formatUnits(pending, decimals));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStake() {
    if (!stakeAmount || isNaN(stakeAmount) || Number(stakeAmount) <= 0) return alert("Enter valid stake amount");
    const amountWei = ethers.utils.parseUnits(stakeAmount, decimals);
    try {
      const allowance = await tokenContract.allowance(account, stakingContractAddress);
      if (allowance.lt(amountWei)) {
        const approveTx = await tokenContract.approve(stakingContractAddress, amountWei);
        await approveTx.wait();
      }
      const stakeTx = await contract.stake(amountWei);
      await stakeTx.wait();
      setStakeAmount('');
      await updateBalances();
    } catch (err) {
      console.error(err);
      alert('Error staking tokens');
    }
  }

  async function handleWithdraw() {
    if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) return alert("Enter valid withdraw amount");
    const amountWei = ethers.utils.parseUnits(withdrawAmount, decimals);
    try {
      const withdrawTx = await contract.withdraw(amountWei);
      await withdrawTx.wait();
      setWithdrawAmount('');
      await updateBalances();
    } catch (err) {
      console.error(err);
      alert('Error withdrawing tokens');
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
      <h1>Crypto Staking Dashboard</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected Account: {account}</p>
          <p>Staked Balance: {stakedBalance}</p>
          <p>Pending Rewards: {pendingRewards}</p>

          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Amount to Stake"
              value={stakeAmount}
              onChange={e => setStakeAmount(e.target.value)}
            />
            <button onClick={handleStake} style={{ marginLeft: '0.5rem' }}>Stake</button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Amount to Withdraw"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
            />
            <button onClick={handleWithdraw} style={{ marginLeft: '0.5rem' }}>Withdraw</button>
          </div>
        </>
      )}
    </div>
  );
}

export default StakingDashboard;
