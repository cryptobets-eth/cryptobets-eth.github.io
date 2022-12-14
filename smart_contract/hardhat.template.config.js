require("@nomicfoundation/hardhat-chai-matchers");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-etherscan");
require('solidity-coverage');
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          outputSelection: {
            "*": {
              "*": ["storageLayout"]
            }
          }
        },
      },
      {
        version: "0.8.6",
        settings: {
          outputSelection: {
            "*": {
              "*": ["storageLayout"]
            }
          }
        },
      },
    ],
  },

  /*networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_PRIVATE_API_KEY}`,
      accounts: [GOERLI_ACCOUNT_PRIVATE_KEY],
    }
  },

  etherscan: {
    apiKey: "ETHERSCAN_PRIVATE_API_KEY", 
  }*/
}