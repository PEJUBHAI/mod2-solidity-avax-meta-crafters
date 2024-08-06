import { useState, useEffect } from "react";
import { ethers } from "ethers";
import pokemon_abi from "../artifacts/contracts/SimplePokemonGame.sol/SimplePokemonGame.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(null);
  const [account, setAccount] = useState(null);
  const [pokemonContract, setPokemonContract] = useState(null);
  const [pokemons, setPokemons] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(0);
  const [fruit, setFruit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const pokemonABI = pokemon_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    } else {
      alert('MetaMask is not installed');
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setError("No account found");
    }
  };

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

  const getPokemonContract = () => {
    if (ethWallet) {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, pokemonABI, signer);
      setPokemonContract(contract);
    }
  };

  const getPokemons = async () => {
    if (pokemonContract) {
      setLoading(true);
      setError(null); // Reset error state
      try {
        const pokemonDetails = [];
        for (let i = 0; i < 3; i++) {
          const [name, trustLevel] = await pokemonContract.getPokemonDetail(i);
          console.log(name, trustLevel);
          pokemonDetails.push({ name, trustLevel: parseInt(trustLevel.toString()) });
        }
        setPokemons(pokemonDetails);
      } catch (error) {
        console.error("Error fetching Pokémon details:", error);
        setError("Error fetching Pokémon details");
      }
      setLoading(false);
    }
  };

  const feedPokemon = async () => {
    if (pokemonContract) {
      setLoading(true);
      setError(null); // Reset error state
      try {
        const tx = await pokemonContract.feedPokemon(selectedPokemon, fruit);
        await tx.wait();
        getPokemons();
      } catch (error) {
        console.error("Error feeding Pokémon:", error);
        setError("Error feeding Pokémon");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    if (ethWallet) {
      getPokemonContract();
    }
  }, [ethWallet]);

  useEffect(() => {
    if (pokemonContract) {
      getPokemons();
    }
  }, [pokemonContract]);

  return (
    <main className="container">
      <header><h1>Welcome to the Simple Pokémon Game!</h1></header>
      {!ethWallet && <p>Please install MetaMask to use this application.</p>}
      {ethWallet && !account && <button onClick={connectAccount}>Connect MetaMask Wallet</button>}
      {account && (
        <div>
          <p>Your Account: {account}</p>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <div>
              <p>Pokémon List:</p>
              <ul>
                {pokemons.length > 0 ? (
                  pokemons.map((pokemon, index) => (
                    <li key={index}>
                      {pokemon.name} - Trust Level: {pokemon.trustLevel}
                    </li>
                  ))
                ) : (
                  <p>No Pokémon found</p>
                )}
              </ul>
              <select onChange={(e) => setSelectedPokemon(e.target.value)} value={selectedPokemon}>
                {pokemons.map((_, index) => (
                  <option key={index} value={index}>Pokemon {index + 1}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Enter fruit (apple/orange)"
                value={fruit}
                onChange={(e) => setFruit(e.target.value)}
              />
              <button onClick={feedPokemon}>Feed Pokémon</button>
            </div>
          )}
        </div>
      )}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
