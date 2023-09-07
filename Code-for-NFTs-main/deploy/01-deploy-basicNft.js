const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const { developementChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("-------------------------------------")
    const args = []

    const basicNft = await deploy("BasicPugNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1,
    })
    if (!developementChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(basicNft.address, args)
    }
}

module.exports.tags = ["all", "basicNft", "main"]
