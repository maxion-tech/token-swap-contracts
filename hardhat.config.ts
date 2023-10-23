import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ledger";

const config: HardhatUserConfig = {
  solidity: "0.8.7",
  networks: {
    bscTestnet: {
      chainId: 97,
      url: process.env.BSC_TESTNET_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY as string] : [],
    },
    bscTestnetHW: {
      chainId: 97,
      url: process.env.BSC_TESTNET_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      ledgerAccounts: process.env.LEDGER_ACCOUNT ? [process.env.LEDGER_ACCOUNT] : [],
    },
    bscMainnet: {
      chainId: 56,
      url: process.env.BSC_MAINNET_URL || "https://bsc-dataseed.binance.org/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY as string] : [],
    },
    bscMainnetHW: {
      chainId: 56,
      url: process.env.BSC_MAINNET_URL || "https://bsc-dataseed.binance.org/",
      ledgerAccounts: process.env.LEDGER_ACCOUNT ? [process.env.LEDGER_ACCOUNT] : [],
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSC_TESTNET_ETHERSCAN_API_KEY || "",
      bscMainnet: process.env.BSC_MAINNET_ETHERSCAN_API_KEY || "",
      bscTestnetHW: process.env.BSC_TESTNET_ETHERSCAN_API_KEY || "",
      bscMainnetHW: process.env.BSC_MAINNET_ETHERSCAN_API_KEY || "",
    }
  }
};

export default config;
