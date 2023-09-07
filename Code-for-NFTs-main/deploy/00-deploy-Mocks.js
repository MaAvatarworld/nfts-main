const { network, ethers } = require("hardhat")
const { developementChains, networkConfig } = require("../helper-hardhat-config")

const BASE_FEE = "250000000000000000",
    GAS_PRICE_LINK = 1e9

const DECIMALS = "18"
const INITIAL_PRICE = "200000000000000000000"

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (chainId === 31337) {
        console.log("Local network found! Deploying Mocks...")
        const args = [BASE_FEE, GAS_PRICE_LINK]

        const VRFCoordinatorV2Mock = await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: args,
            logs: true,
        })

        const AggregatorV3Mock = await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks Deployed!")
        log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        log("You are deploying to a local network, you'll need a local network running to interact")
        log(
            "Please run `yarn hardhat console --network localhost` to interact with the deployed smart contracts!"
        )
        log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    }
}

module.exports.tags = ["all", "mocks", "main"]
