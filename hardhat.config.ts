import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("hardhat-contract-sizer");

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10_000,
      },
    },
  },

  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true
  }
};

export default config;
