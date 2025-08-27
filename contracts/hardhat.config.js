require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");

require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    "very-testnet": {
      url: process.env.VERY_TESTNET_RPC_URL || "https://testnet-rpc.very.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 12052024,
      gasPrice: "auto"
    },
    "very-mainnet": {
      url: process.env.VERY_MAINNET_RPC_URL || "https://rpc.very.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 12052024,
      gasPrice: "auto"
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  },
  etherscan: {
    apiKey: {
      "very-testnet": process.env.VERY_API_KEY || "dummy",
      "very-mainnet": process.env.VERY_API_KEY || "dummy"
    },
    customChains: [
      {
        network: "very-testnet",
        chainId: 12052024,
        urls: {
          apiURL: "https://testnet-api.very.network/api",
          browserURL: "https://testnet-explorer.very.network"
        }
      },
      {
        network: "very-mainnet",
        chainId: 12052024,
        urls: {
          apiURL: "https://api.very.network/api",
          browserURL: "https://explorer.very.network"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};