# 🔄 Maxion TokenSwap Project
[![MythXBadge](https://badgen.net/https/api.mythx.io/v1/projects/cac9d71a-34ae-4b54-8fc3-c90bfdd50e18/badge/data?cache=300&icon=https://raw.githubusercontent.com/ConsenSys/mythx-github-badge/main/logo_white.svg)](https://docs.mythx.io/dashboard/github-badges)

The TokenSwap project is a blockchain-based initiative that allows for the seamless swapping of tokens. It involves two ERC-20 compliant tokens. This project employs smart contracts deployed on the Ethereum network and is developed using Solidity, along with the Hardhat development environment.

### 🌟 Features
- 🔄 Token Swapping: Enables the exchange of TransferToken for MintableToken and vice versa.
- 🛠️ Flexible Fee Structure: Offers adjustable fee structures for both minting and transferring tokens.
- 🌐 Decentralized: Runs on the Ethereum blockchain, ensuring transparency and security.
- 🔒 Owner Privileges: Allows the owner to grant roles and adjust fee structures.

### 🛠️ Technologies Used
- Solidity
- Hardhat
- Ethers.js
- Chai

# 🚀 Getting Started
### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0
- Hardhat

### Installation
1. Clone the repository:
```bash
git clone https://github.com/maxion-tech/token-swap-contracts.git
```
2. Navigate to the project directory:
```bash
cd token-swap-contracts
```
3. Install the dependencies:
```bash
npm install
```

### Deployment
1. Compile the contracts:
```bash
npx hardhat compile
```
2. Deploy the contracts to the local Hardhat network:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

# 🧪 Running Tests
To run the test suite, use the following command:
```bash
npx hardhat test
```

# 📜 Smart Contracts

- ERC20MintableBurnable: Defines the basic ERC-20 compliant token with additional mint and burn functionalities.
- TokenSwap: The main contract that handles the token swapping logic, rate adjustments, and fee implementations.

# 🙏 Acknowledgements
- [Hardhat](https://hardhat.org/)
- [Ethers.js](https://docs.ethers.io/v5/)
- [Chai](https://www.chaijs.com/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Solidity](https://docs.soliditylang.org/en/v0.8.7/)
- [Ethereum](https://ethereum.org/en/)

# License
Distributed under the MIT License. See `LICENSE` for more information.