require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    base: {
      url: process.env.TESTNET_RPC_URL,  
      accounts: [process.env.PRIVATE_KEY], 
    },
  },
};
