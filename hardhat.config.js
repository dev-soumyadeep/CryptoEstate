require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");
require('dotenv').config()
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.20",
  networks:{
    sepolia:{
      url:`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts:[`${process.env.PRIVATE_KEY}`]
    }
  },
  etherscan :{
    apiKey:process.env.ETHERSCAN_API_KEY
  }
};
