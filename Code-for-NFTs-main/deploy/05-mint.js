const { network, ethers } = require("hardhat")

module.exports = async function ({ getNamedAccounts, deployments }) {
    let deployer, accounts
    accounts = await getNamedAccounts()
    deployer = accounts[0]

    const basicNft = await ethers.getContract("BasicPugNft", deployer)
    const basicNftResponse = await basicNft.mintNFT()
    await basicNftResponse.wait(1)
    console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`)

    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const highValue = ethers.utils.parseEther("4000")
    const dyanmicSvgResponse = await dynamicSvgNft.mintNFT(highValue)
    console.log(dynamicSvgNft.address)
    await dyanmicSvgResponse.wait(1)
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)

    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()
    const responseRandomIpfs = await randomIpfsNft.requestNFT({ value: mintFee })
    const randomIpfsNftMintTxReceipt = await responseRandomIpfs.wait(1)

    await new Promise((resolve, reject) => {
        setTimeout(resolve(), 300000)

        randomIpfsNft.once("Nft_minted", async () => {
            resolve()
        })

        // if(network.config.chainId == 31337){
        //     const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
        //     const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        //     await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        // }
        // console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)
    })
}

module.exports.tags = ["all", "mint"]
