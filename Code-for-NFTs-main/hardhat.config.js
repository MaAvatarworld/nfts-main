require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        rinkeby: {
            url: process.env.RINKEBY_RPC_URL,
            chainId: 4,
            accounts: [process.env.PRIVATE_KEY],
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
    etherscan: {
        apiKey: {
            rinkeby: process.env.ETHERSCAN_API_KEY,
            kovan: process.env.ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    contractSizer: {
        runOnCompile: false,
        only: ["Raffle"],
    },
    solidity: {
        compilers: [
            {
                version: "0.8.15",
            },
            {
                version: "0.6.6",
            },
        ],
    },
    mocha: {
        timeout: 200000,
    },
}
