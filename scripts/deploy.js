async function main() {
  // Get the contract factory
  const SimplePokemonGame = await ethers.getContractFactory("SimplePokemonGame");
  
  // Deploy the contract
  const simplePokemonGame = await SimplePokemonGame.deploy();
  console.log("Contract deployed to address:", simplePokemonGame.address);
}

// Run the main function and handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
