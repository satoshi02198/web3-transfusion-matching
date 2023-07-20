const keys = require("./keys.json");

/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
module.exports = {
  solidity: "0.8.18",
  networks: {
    localhost: {},
    hardhat: {
      chainId: 31337,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${keys.INFURA_API_KEY}`,
      chainId: 5,
      accounts: [keys.PRIVATE_KEY],
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${keys.INFURA_API_KEY}`,
      chainId: 11155111,
      accounts: [keys.PRIVATE_KEY],
    },
  },
};
