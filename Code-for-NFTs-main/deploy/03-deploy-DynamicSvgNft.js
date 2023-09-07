const { network, ethers } = require("hardhat")
const { developementChains, networkConfig } = require("../helper-hardhat-config")
const fs = require("fs")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let AggregatorV3Address
    if (chainId === 31337) {
        const EthUsdAggregator = await deployments.get("MockV3Aggregator")
        AggregatorV3Address = EthUsdAggregator.address
    } else {
        AggregatorV3Address = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const lowSvg = await fs.readFileSync(
        "E:/web3 projects/nft/nft backend/images/dynamicNft/frown.svg",
        { encoding: "utf-8" }
    )
    const highSvg = await fs.readFileSync(
        "E:/web3 projects/nft/nft backend/images/dynamicNft/happy.svg",
        { encoding: "utf-8" }
    )
    const args = [lowSvg, highSvg, AggregatorV3Address]

    log("-----------------------------------------------")
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfrimations: network.config.blockConfirmations || 1,
    })
    log("-----------------------------------------------")

    // Verify the deployment
    if (!developementChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dynamicSvgNft.address, args)
    }
}

module.exports.tags = ["all", "dynamicSvgNft", "main"]
