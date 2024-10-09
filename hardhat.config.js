require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config()
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.20",
  networks:{
    polygonAmoy:{
      url:`https://polygon-amoy.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts:[`${process.env.PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.OKLINK_API_KEY,
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://www.oklink.com/api/explorer/v1/contract/verify/async/api/polygonAmoy",
          browserURL: "https://www.oklink.com/polygonAmoy"
        },
      }
    ]
  },

  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
};
