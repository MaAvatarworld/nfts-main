const { assert, expect } = require("chai")
const { network, ethers, deployments } = require("hardhat")
const { developementChains, networkConfig } = require("../../helper-hardhat-config")

!developementChains.includes(network.name)
    ? describe.skip
    : describe("unit tests for dynamic svg nft", function () {
          let dynamicSvgNft, accounts, deployer, mintFee, MockV3Aggregator
          const frownNft =
              "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBzdGFuZGFsb25lPSdubyc/Pgo8c3ZnIHdpZHRoPScxMDI0cHgnIGhlaWdodD0nMTAyNHB4JyB2aWV3Qm94PScwIDAgMTAyNCAxMDI0JyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPgogIDxwYXRoIGZpbGw9JyMzMzMnIGQ9J001MTIgNjRDMjY0LjYgNjQgNjQgMjY0LjYgNjQgNTEyczIwMC42IDQ0OCA0NDggNDQ4IDQ0OC0yMDAuNiA0NDgtNDQ4Uzc1OS40IDY0IDUxMiA2NHptMCA4MjBjLTIwNS40IDAtMzcyLTE2Ni42LTM3Mi0zNzJzMTY2LjYtMzcyIDM3Mi0zNzIgMzcyIDE2Ni42IDM3MiAzNzItMTY2LjYgMzcyLTM3MiAzNzJ6Jy8+CiAgPHBhdGggZmlsbD0nI0U2RTZFNicgZD0nTTUxMiAxNDBjLTIwNS40IDAtMzcyIDE2Ni42LTM3MiAzNzJzMTY2LjYgMzcyIDM3MiAzNzIgMzcyLTE2Ni42IDM3Mi0zNzItMTY2LjYtMzcyLTM3Mi0zNzJ6TTI4OCA0MjFhNDguMDEgNDguMDEgMCAwIDEgOTYgMCA0OC4wMSA0OC4wMSAwIDAgMS05NiAwem0zNzYgMjcyaC00OC4xYy00LjIgMC03LjgtMy4yLTguMS03LjRDNjA0IDYzNi4xIDU2Mi41IDU5NyA1MTIgNTk3cy05Mi4xIDM5LjEtOTUuOCA4OC42Yy0uMyA0LjItMy45IDcuNC04LjEgNy40SDM2MGE4IDggMCAwIDEtOC04LjRjNC40LTg0LjMgNzQuNS0xNTEuNiAxNjAtMTUxLjZzMTU1LjYgNjcuMyAxNjAgMTUxLjZhOCA4IDAgMCAxLTggOC40em0yNC0yMjRhNDguMDEgNDguMDEgMCAwIDEgMC05NiA0OC4wMSA0OC4wMSAwIDAgMSAwIDk2eicvPgogIDxwYXRoIGZpbGw9JyMzMzMnIGQ9J00yODggNDIxYTQ4IDQ4IDAgMSAwIDk2IDAgNDggNDggMCAxIDAtOTYgMHptMjI0IDExMmMtODUuNSAwLTE1NS42IDY3LjMtMTYwIDE1MS42YTggOCAwIDAgMCA4IDguNGg0OC4xYzQuMiAwIDcuOC0zLjIgOC4xLTcuNCAzLjctNDkuNSA0NS4zLTg4LjYgOTUuOC04OC42czkyIDM5LjEgOTUuOCA4OC42Yy4zIDQuMiAzLjkgNy40IDguMSA3LjRINjY0YTggOCAwIDAgMCA4LTguNEM2NjcuNiA2MDAuMyA1OTcuNSA1MzMgNTEyIDUzM3ptMTI4LTExMmE0OCA0OCAwIDEgMCA5NiAwIDQ4IDQ4IDAgMSAwLTk2IDB6Jy8+Cjwvc3ZnPgo="
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["mocks", "dynamciSvgNft"])
              dynamicSvgNft = await ethers.getContract("DynamicSvgNft")
              MockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
          })

          describe("Contructor", () => {
              it("It should initialize the constructor properly", async () => {
                  const lowSvgUri = await dynamicSvgNft.getLowSvgURI()
                  const highSvgUri = await dynamicSvgNft.getHighSvgURI()
                  const priceFeed = await dynamicSvgNft.getPriceFeed()
                  assert.equal(lowSvgUri, frownNft)
                  expect(priceFeed.toString() != "")
                  expect(highSvgUri.toString() != "")
              })
          })

          describe("mint NFT", () => {
              it("should emit the event after creating nft", async () => {
                  const highValue = ethers.utils.parseEther("1")
                  const counter = await dynamicSvgNft.getTokenCounter()
                  await expect(dynamicSvgNft.mintNFT(highValue)).to.emit(
                      dynamicSvgNft,
                      "NFTCreated"
                  )
                  const newCounter = await dynamicSvgNft.getTokenCounter()

                  assert.equal(counter.toNumber() + 1, newCounter.toNumber())
              })
          })

          describe("get token uri", () => {
              it("should return the token uri", async () => {
                  const highValue = ethers.utils.parseEther("1")
                  const tokenId = await dynamicSvgNft.getTokenCounter()
                  await dynamicSvgNft.mintNFT(highValue)
                  const tokenUri = await dynamicSvgNft.tokenURI(tokenId)
                  await MockV3Aggregator.latestRoundData()

                  console.log(tokenUri.toString())
                  expect(tokenUri.toString() != "")
              })
          })
      })
