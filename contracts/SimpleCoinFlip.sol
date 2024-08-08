// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleCoinFlip {
    address public owner;

    constructor() {
        owner = msg.sender;
        balances[owner] = 100; // Initialize with 100 coins
    }

    enum Side { Heads, Tails }

    mapping(address => uint256) public balances;

    event CoinFlipped(address indexed player, Side choice, Side result, uint256 amount, bool won);
    event BalanceUpdated(address indexed player, uint256 newBalance);

    // Function to play the game using the internal balance
    function flip(Side _choice, uint256 _betAmount) public {
        require(_betAmount > 0, "Bet amount must be greater than zero.");
        require(balances[msg.sender] >= _betAmount, "Insufficient balance.");

        // Generate a pseudo-random number using block.timestamp and block.difficulty
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.difficulty))) % 2;
        Side result = random == 0 ? Side.Heads : Side.Tails;

        bool won = _choice == result;

        if (won) {
            balances[msg.sender] += _betAmount; // Double the bet amount if won
        } else {
            balances[msg.sender] -= _betAmount; // Lose the bet amount if lost
        }

        emit CoinFlipped(msg.sender, _choice, result, _betAmount, won);
        emit BalanceUpdated(msg.sender, balances[msg.sender]);
    }

    // Function to check the player's balance
    function getPlayerBalance(address _player) public view returns (uint256) {
        return balances[_player];
    }
}
