// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleCoinFlip {
	// Address of the contract owner
	address public owner;

	// Constructor to initialize the contract
	constructor() {
		owner = msg.sender; // Set the contract creator as the owner
		balances[owner] = 100; // Initialize the owner's balance with 100 coins
	}

	// Enum to represent the two possible sides of the coin
	enum Side { Heads, Tails }

	// Mapping to track the balance of each player
	mapping(address => uint256) public balances;

	// Event emitted when a coin flip occurs
	event CoinFlipped(
		address indexed player, // Address of the player
		Side choice, // The side chosen by the player
		Side result, // The result of the coin flip
		uint256 amount, // The amount of coins bet
		bool won // Whether the player won or lost
	);

	// Event emitted when a player's balance is updated
	event BalanceUpdated(
		address indexed player, // Address of the player
		uint256 newBalance // The new balance of the player
	);

	// Custom errors for error handling
	error BetAmountMustBeGreaterThanZero();
	error InsufficientBalance(uint256 available, uint256 required);
	error InvalidSideChoice();

	// Function to flip the coin and determine the outcome
	function flip(Side _choice, uint256 _betAmount) public {
		// Ensure the bet amount is greater than zero
		if (_betAmount <= 0) {
			revert BetAmountMustBeGreaterThanZero();
		}

		// Check if the player has enough balance to place the bet
		if (balances[msg.sender] < _betAmount) {
			revert InsufficientBalance(balances[msg.sender], _betAmount);
		}

		// Ensure the player has chosen a valid side
		if (_choice != Side.Heads && _choice != Side.Tails) {
			revert InvalidSideChoice();
		}

		// Generate a pseudo-random number to determine the result
		uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.difficulty))) % 2;
		Side result = random == 0 ? Side.Heads : Side.Tails;

		// Determine if the player won or lost
		bool won = _choice == result;

		// Update the player's balance based on the result
		if (won) {
			balances[msg.sender] += _betAmount; // Double the bet amount if won
		} else {
			balances[msg.sender] -= _betAmount; // Lose the bet amount if lost
		}

		// Emit events for the coin flip and balance update
		emit CoinFlipped(msg.sender, _choice, result, _betAmount, won);
		emit BalanceUpdated(msg.sender, balances[msg.sender]);
	}

	// Function to check the balance of a specified player
	function getPlayerBalance(address _player) public view returns (uint256) {
		return balances[_player];
	}
}
