const { expect, assert } = require("chai")
const { network, ethers, deployments } = require("hardhat")
const { developementChains } = require("../../helper-hardhat-config")

!developementChains.includes(network.name)
    ? describe.skip
    : describe("unit test for basic nft", () => {
          let bNft, accounts, deployer
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["mocks", "basicNft"])
              bNft = await ethers.getContract("BasicPugNft")
          })
          it("should set the counter variable correctly", async () => {
              const counter = await bNft.getTokenCounter()
              assert.equal(counter.toString(), "0")
          })

          it("should increment the counter variable after minting an NFT", async () => {
              const counter = await bNft.getTokenCounter()
              const txRes = await bNft.mintNFT()
              await txRes.wait(1)
              const newCounter = await bNft.getTokenCounter()
              const tokenUri = await bNft.getTokenUri()
              const tokenIdToUri = await bNft.tokenURI(counter)
              assert.equal(newCounter.toString(), "1")
              console.log(tokenIdToUri.toString())
              expect(tokenIdToUri.toString() != "")
              assert.equal(tokenUri, "ipfs://QmYxBFQM5ocoGZtPfsEwvDTFxpUF6PigMv64D3KAhyysH1")
          })
      })
