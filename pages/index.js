import { useState, useEffect } from "react";
import { ethers } from "ethers";
import coinflip_abi from "../artifacts/contracts/SimpleCoinFlip.sol/SimpleCoinFlip.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(null);
  const [account, setAccount] = useState(null);
  const [coinflipContract, setCoinflipContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState('');
  const [selectedSide, setSelectedSide] = useState('Heads');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
  const coinflipABI = coinflip_abi.abi;

  // Initialize the Ethereum wallet
  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    } else {
      alert('MetaMask is not installed');
    }
  };

  // Handle the account change
  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setError("No account found");
    }
  };

  // Connect MetaMask wallet
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

  // Initialize the contract
  const getCoinflipContract = () => {
    if (ethWallet) {
      const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, coinflipABI, signer);
      setCoinflipContract(contract);
    }
  };

  // Fetch the balance of the player
  const getBalance = async () => {
    if (coinflipContract && account) {
      try {
        const balance = await coinflipContract.getPlayerBalance(account);
        setBalance(parseInt(balance.toString()));
      } catch (error) {
        console.error("Error fetching balance:", error);
        setError("Error fetching balance");
      }
    }
  };

  // Flip the coin and update balance
  const flipCoin = async () => {
    if (coinflipContract && account) {
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const playerBalance = await coinflipContract.getPlayerBalance(account);
        const betAmountAsNumber = parseInt(betAmount);

        if (playerBalance < betAmountAsNumber) {
          setError("Insufficient balance.");
          setLoading(false);
          return;
        }

        const tx = await coinflipContract.flip(
          selectedSide === 'Heads' ? 0 : 1,
          betAmountAsNumber
        );
        const receipt = await tx.wait();
        const event = receipt.events.find(event => event.event === 'CoinFlipped');
        const { choice, result: tossResult, won } = event.args;
        setResult({
          choice: choice === 0 ? 'Heads' : 'Tails',
          result: tossResult === 0 ? 'Heads' : 'Tails',
          won
        });
        getBalance();
      } catch (error) {
        console.error("Error flipping coin:", error);
        setError(`Error flipping coin: ${error.message}`);
      }
      setLoading(false);
    }
  };

  // Effect to initialize the wallet and contract
  useEffect(() => {
    getWallet();
  }, []);

  // Effect to initialize the contract when wallet is available
  useEffect(() => {
    if (ethWallet) {
      getCoinflipContract();
    }
  }, [ethWallet]);

  // Effect to fetch balance when contract or account changes
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
                <select className="select" onChange={(e) => setSelectedSide(e.target.value)} value={selectedSide}>
                  <option value="Heads">Heads</option>
                  <option value="Tails">Tails</option>
                </select>
                <input
                  className="input"
                  type="number"
                  placeholder="Enter bet amount"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                />
                <button className="button" onClick={flipCoin}>Flip Coin</button>
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
        .result.won {
          color: #00e676;
        }
        .result.lost {
          color: #ff5252;
        }
      `}</style>
    </main>
  );
  
}
