async function main() {
  // Get the contract factory
  const SimpleCoinFlip = await ethers.getContractFactory("SimpleCoinFlip");
  
  // Deploy the contract
  const simpleCoinFlip = await SimpleCoinFlip.deploy();
  console.log("Contract deployed to address:", simpleCoinFlip.address);
}

// Run the main function and handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
