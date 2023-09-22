import hre, { ethers } from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Get TransferToken and MintableToken addresses from environment variables
  const transferTokenAddress = process.env.TRANSFER_TOKEN_ADDRESS;
  const mintableTokenAddress = process.env.MINTABLE_TOKEN_ADDRESS;

  if (!transferTokenAddress || !mintableTokenAddress) {
    console.error("Please set the TRANSFER_TOKEN_ADDRESS and MINTABLE_TOKEN_ADDRESS environment variables in .env file");
    process.exit(1);
  }

  // Deploy TokenSwap Contract
  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy(
    deployer.address, // Admin Address
    transferTokenAddress, // TransferToken Address from .env
    mintableTokenAddress, // MintableToken Address from .env
    3, // Initial rate
    0, // transferTokenFeePercentage (0%)
    10  // mintableTokenFeePercentage (10%)
  );

  console.log("TokenSwap deployed to:", await tokenSwap.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });