import hre, { ethers } from "hardhat";

async function main() {
  const deployer = (await hre.ethers.getSigners())[0];
  // Get TransferToken and MintableToken addresses from environment variables
  const transferTokenAddress = process.env.TRANSFER_TOKEN_ADDRESS;
  const mintableTokenAddress = process.env.MINTABLE_TOKEN_ADDRESS
  const adminAddress = process.env.ADMIN_ADDRESS;

  if (!transferTokenAddress || !mintableTokenAddress || !adminAddress) {
    console.error("Please set the TRANSFER_TOKEN_ADDRESS, MINTABLE_TOKEN_ADDRESS and ADMIN_ADDRESS environment variables in .env file");
    process.exit(1);
  }

  const initialRate = 3; // Initial rate
  const transferTokenFeePercentage = 0; // transferTokenFeePercentage (0%)
  const mintableTokenFeePercentage = 10 * 10 ** 8; // mintableTokenFeePercentage (10%)

  // Deploy TokenSwap Contract
  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy(
    adminAddress, // Admin Address
    transferTokenAddress, // TransferToken Address from .env
    mintableTokenAddress, // MintableToken Address from .env
    initialRate, // Initial rate
    transferTokenFeePercentage, // transferTokenFeePercentage
    mintableTokenFeePercentage  // mintableTokenFeePercentage
  );

  console.log("TokenSwap deployed to:", await tokenSwap.getAddress());
  console.log(`Verify with: npx hardhat verify --network ${hre.network.name} ${await tokenSwap.getAddress()} ${adminAddress} ${transferTokenAddress} ${mintableTokenAddress} ${initialRate} ${transferTokenFeePercentage} ${mintableTokenFeePercentage}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });