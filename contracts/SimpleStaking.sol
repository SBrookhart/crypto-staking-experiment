// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender,address recipient,uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SimpleStaking {
    IERC20 public stakingToken;
    uint256 public rewardRate; // reward tokens per block
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public rewardDebt;
    uint256 public accRewardPerShare;
    uint256 public lastRewardBlock;

    constructor(IERC20 _stakingToken, uint256 _rewardRate) {
        stakingToken = _stakingToken;
        rewardRate = _rewardRate;
        lastRewardBlock = block.number;
    }

    function updatePool() internal {
        uint256 blocks = block.number - lastRewardBlock;
        if (blocks > 0) {
            uint256 totalStaked = stakingToken.balanceOf(address(this));
            if (totalStaked > 0) {
                accRewardPerShare += blocks * rewardRate * 1e12 / totalStaked;
            }
            lastRewardBlock = block.number;
        }
    }

    function stake(uint256 amount) external {
        updatePool();
        if (stakedBalance[msg.sender] > 0) {
            uint256 pending = stakedBalance[msg.sender] * accRewardPerShare / 1e12 - rewardDebt[msg.sender];
            if (pending > 0) {
                stakingToken.transfer(msg.sender, pending);
            }
        }
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        rewardDebt[msg.sender] = stakedBalance[msg.sender] * accRewardPerShare / 1e12;
    }

    function withdraw(uint256 amount) external {
        require(stakedBalance[msg.sender] >= amount, "Withdraw: Not enough balance");
        updatePool();
        uint256 pending = stakedBalance[msg.sender] * accRewardPerShare / 1e12 - rewardDebt[msg.sender];
        if (pending > 0) {
            stakingToken.transfer(msg.sender, pending);
        }
        stakedBalance[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
        rewardDebt[msg.sender] = stakedBalance[msg.sender] * accRewardPerShare / 1e12;
    }

    function pendingReward(address user) external view returns (uint256) {
        uint256 _accRewardPerShare = accRewardPerShare;
        uint256 blocks = block.number - lastRewardBlock;
        uint256 totalStaked = stakingToken.balanceOf(address(this));
        if (blocks > 0 && totalStaked > 0) {
            _accRewardPerShare += blocks * rewardRate * 1e12 / totalStaked;
        }
        return stakedBalance[user] * _accRewardPerShare / 1e12 - rewardDebt[user];
    }
}
