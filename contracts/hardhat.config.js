require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    base: {
      url: process.env.RPC_URL,  
      accounts: [process.env.PRIVATE_KEY], 
    },
  },
};
