const { network, ethers } = require("hardhat")
const { developementChains, networkConfig } = require("../helper-hardhat-config")
const { saveImagesToPinata, saveMetadataToPinata } = require("../utils/uploadToPinata")
const { verify } = require("../utils/verify")
require("dotenv").config()

const FUND_AMOUNT = "1000000000000000000000"
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

let tokenUris = [
    "ipfs://QmXTyJ866BpdFDoQVAK6c7x5eWakz3tAyP6E88jDAUGeVC",
    "ipfs://QmVuhVaXtNMMo78THR4jH1FnRRXJ8LsNhrd6j6qz62Giqq",
    "ipfs://QmVbnH72sA7W25g4gAQ7MBBCjy56xsSdFJB29uANs2diPA",
]
let imagePath = "../../../../web3 projects/nft/nft backend/images/randomNft"
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2, gasLane, callbackGasLimit, subscriptionId, nftPrice

    if (process.env.UPLOAD_TO_PINATA === "true") {
        tokenUris = await uploadTokenUris()
    }

    if (developementChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2 = VRFCoordinatorV2Mock.address
        const txResponse = await VRFCoordinatorV2Mock.createSubscription()
        const txReciept = await txResponse.wait(1)
        subscriptionId = txReciept.events[0].args.subId
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2 = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    gasLane = networkConfig[chainId]["gasLane"]
    callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    nftPrice = networkConfig[chainId]["nftPrice"]

    const args = [vrfCoordinatorV2, gasLane, callbackGasLimit, subscriptionId, nftPrice, tokenUris]
    log("-----------------------------------------------")

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("-----------------------------------------------")
    if (!developementChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomIpfsNft.address, args)
    }
}

async function uploadTokenUris() {
    tokenUris = []
    const { responses: imageResponses, imageFiles } = await saveImagesToPinata(imagePath)
    for (imageResponsesIndex in imageResponses) {
        let imageTokenMetadata = { ...metadataTemplate }
        imageTokenMetadata.name = imageFiles[imageResponsesIndex].replace(".png", "")
        imageTokenMetadata.description = `An adorable ${imageTokenMetadata.name} pug`
        imageTokenMetadata.image = `ipfs://${imageResponses[imageResponsesIndex].IpfsHash}`
        console.log("uploading token URI's...")
        const pinJsonMetadataResponse = await saveMetadataToPinata(imageTokenMetadata)
        tokenUris.push(`ipfs://${pinJsonMetadataResponse.IpfsHash}`)
    }
    console.log("Token URI's uploaded...")
    console.log("These are:")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "pinToIpfs", "main"]
