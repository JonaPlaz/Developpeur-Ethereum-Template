require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");
require("@nomicfoundation/hardhat-verify");

const HOLESKY_RPC_URL = process.env.HOLESKY_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_ID = process.env.ETHERSCAN_API_ID || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    holesky: {
      url: HOLESKY_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 17000,
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_ID
  },
  solidity: {
    compilers: [
      {
        version: "0.8.28",
      }
    ]
  },
};
