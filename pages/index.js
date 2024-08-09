import { useState, useEffect } from "react";
import { ethers } from "ethers";
import coinflip_abi from "../artifacts/contracts/SimpleCoinFlip.sol/SimpleCoinFlip.json";

export default function HomePage() {
		// State variables to manage different parts of the application
		const [ethWallet, setEthWallet] = useState(null); // Stores MetaMask wallet instance
		const [account, setAccount] = useState(null); // Stores the connected account address
		const [coinflipContract, setCoinflipContract] = useState(null); // Stores the contract instance
		const [balance, setBalance] = useState(0); // Stores the player's balance in the game
		const [betAmount, setBetAmount] = useState(''); // Stores the amount the player wants to bet
		const [selectedSide, setSelectedSide] = useState('Heads'); // Stores the player's choice of "Heads" or "Tails"
		const [result, setResult] = useState(null); // Stores the result of the coin flip
		const [loading, setLoading] = useState(false); // Indicates if the app is performing an action
		const [error, setError] = useState(null); // Stores any error messages

		const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
		const coinflipABI = coinflip_abi.abi; // The ABI (Application Binary Interface) for the contract

		// Function to check if MetaMask is installed and set the wallet instance
		const getWallet = async () => {
				if (window.ethereum) {
						setEthWallet(window.ethereum);
				} else {
						alert('MetaMask is not installed');
				}
		};

		// Function to handle the account selection from MetaMask
		const handleAccount = (accounts) => {
				if (accounts.length > 0) {
						setAccount(accounts[0]); // Set the first account as the connected account
				} else {
						setError("No account found");
				}
		};

		// Function to connect the MetaMask account to the app
		const connectAccount = async () => {
				if (!ethWallet) {
						alert('MetaMask wallet is required to connect');
						return;
				}

				try {
						const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
						handleAccount(accounts);
				} catch (error) {
						console.error("Error connecting MetaMask:", error);
						setError("Error connecting MetaMask");
				}
		};

		// Function to initialize the contract instance
		const getCoinflipContract = () => {
				if (ethWallet) {
						const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545"); // Connect to local blockchain
						const signer = provider.getSigner(); // Get the signer (the account that will send transactions)
						const contract = new ethers.Contract(contractAddress, coinflipABI, signer); // Create the contract instance
						setCoinflipContract(contract);
				}
		};

		// Function to fetch the player's balance from the contract
		const getBalance = async () => {
				if (coinflipContract && account) {
						try {
								const balance = await coinflipContract.getPlayerBalance(account);
								setBalance(parseInt(balance.toString())); // Convert balance to a number and set it
						} catch (error) {
								console.error("Error fetching balance:", error);
								setError("Error fetching balance");
						}
				}
		};

		// Function to flip the coin and update the balance
		const flipCoin = async () => {
				if (coinflipContract && account) {
						setLoading(true);
						setError(null);
						setResult(null);
						try {
								const playerBalance = await coinflipContract.getPlayerBalance(account);
								const betAmountAsNumber = parseInt(betAmount);

								// Validate bet amount and player balance
								if (betAmountAsNumber <= 0) {
										setError("Invalid bet amount.");
										setLoading(false);
										return;
								}

								if (playerBalance < betAmountAsNumber) {
										setError("Insufficient balance.");
										setLoading(false);
										return;
								}

								// Call the flip function in the contract
								const tx = await coinflipContract.flip(
										selectedSide === 'Heads' ? 0 : 1,
										betAmountAsNumber
								);
								const receipt = await tx.wait(); // Wait for the transaction to be confirmed
								const event = receipt.events.find(event => event.event === 'CoinFlipped');
								const { choice, result: tossResult, won } = event.args;

								// Set the result of the coin flip
								setResult({
										choice: choice === 0 ? 'Heads' : 'Tails',
										result: tossResult === 0 ? 'Heads' : 'Tails',
										won
								});
								getBalance(); // Update the balance after the flip
						} catch (error) {
								console.error("Error flipping coin:", error);
								setError(`Error flipping coin: ${error.message}`);
						}
						setLoading(false); // Stop the loading indicator
				}
		};

		// Run getWallet when the component mounts
		useEffect(() => {
				getWallet();
		}, []);

		// Run getCoinflipContract when ethWallet is set
		useEffect(() => {
				if (ethWallet) {
						getCoinflipContract();
				}
		}, [ethWallet]);

		// Run getBalance when coinflipContract or account changes
		useEffect(() => {
				if (coinflipContract && account) {
						getBalance();
				}
		}, [coinflipContract, account]);

		return (
				<main className="container">
						<header>
								<h1>Simple Coin Flip Game</h1>
						</header>
						<section className="info">
								{/* Show different content based on the app state */}
								{!ethWallet ? (
										<p>Please install MetaMask to use this application.</p>
								) : !account ? (
										<button className="button" onClick={connectAccount}>Connect MetaMask Wallet</button>
								) : (
										<div className="account-info">
												<p>Your Account: {account}</p>
												<p>Balance: {balance} coins</p>
												{loading ? (
														<p className="loading">Loading...</p>
												) : error ? (
														<p className="error">{error}</p>
												) : (
														<div className="game-controls">
																{/* Choose heads or tails */}
																<select className="select" onChange={(e) => setSelectedSide(e.target.value)} value={selectedSide}>
																		<option value="Heads">Heads</option>
																		<option value="Tails">Tails</option>
																</select>
																{/* Enter the bet amount */}
																<input
																		className="input"
																		type="number"
																		placeholder="Enter bet amount"
																		value={betAmount}
																		onChange={(e) => setBetAmount(e.target.value)}
																/>
																{/* Flip the coin */}
																<button className="button" onClick={flipCoin}>Flip Coin</button>
																{/* Show the result of the flip */}
																{result && (
																		<div className={`result ${result.won ? 'won' : 'lost'}`}>
																				<p>You chose: {result.choice}</p>
																				<p>Result: {result.result}</p>
																				<p className={result.won ? 'won' : 'lost'}>
																						{result.won ? 'You won!' : 'You lost!'}
																				</p>
																		</div>
																)}
														</div>
												)}
										</div>
								)}
						</section>
						{/* Styling for the page */}
						<style jsx>{`
								.container {
										max-width: 600px;
										margin: auto;
										padding: 20px;
										background-color: #121212;
										color: #e0e0e0;
										border-radius: 8px;
										box-shadow: 0 4px 8px rgba(0,0,0,0.5);
										text-align: center;
								}
								header h1 {
										color: #e0e0e0;
										margin-bottom: 20px;
								}
								.info {
										margin: 20px 0;
								}
								.account-info {
										display: flex;
										flex-direction: column;
										align-items: center;
								}
								.button {
										padding: 10px 20px;
										margin: 10px;
										border: none;
										border-radius: 5px;
										background-color: #6200ea;
										color: #e0e0e0;
										cursor: pointer;
										font-size: 16px;
								}
								.button:hover {
										background-color: #3700b3;
								}
								.select, .input {
										padding: 10px;
										margin: 10px;
										border: 1px solid #333;
										border-radius: 5px;
										background-color: #333;
										color: #e0e0e0;
										font-size: 16px;
								}
								.game-controls {
										margin-top: 20px;
								}
								.loading {
										font-size: 18px;
										color: #888;
								}
								.error {
										color: #ff5252;
										font-size: 18px;
								}
								.result {
										margin-top: 20px;
										font-size: 18px;
										font-weight: bold;
								}
								.won {
										color: #4caf50;
								}
								.lost {
										color: #ff5252;
								}
						`}</style>
				</main>
		);
}
