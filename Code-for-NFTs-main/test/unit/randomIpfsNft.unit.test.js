const { assert, expect } = require("chai")
const { network, ethers, deployments } = require("hardhat")
const { resolve } = require("path")
const { developementChains, networkConfig } = require("../../helper-hardhat-config")

!developementChains.includes(network.name)
    ? describe.skip
    : describe("Unit tests for random ipfs nft", function () {
          let randomIpfsNft, accounts, deployer, mintFee, vrfCoordinatorV2
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["mocks", "pinToIpfs"])
              randomIpfsNft = await ethers.getContract("RandomIpfsNft")
              mintFee = await randomIpfsNft.getMintFee()
              vrfCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock")
          })

          it("should initialize varialbles correctly", async () => {
              mintFee = await randomIpfsNft.getMintFee()
              const tokenCounter = await randomIpfsNft.getTokenCounter()
              const tokenUriAtIndex = await randomIpfsNft.getDogTokenUri(0)
              const initialized = await randomIpfsNft.getInitialized()

              assert.equal(mintFee.toString(), "10000000000000000")
              assert.equal(tokenCounter.toString(), "0")
              assert.equal(
                  tokenUriAtIndex.toString(),
                  "ipfs://QmXTyJ866BpdFDoQVAK6c7x5eWakz3tAyP6E88jDAUGeVC"
              )
              assert.equal(initialized.toString(), "true")
          })

          describe("request nft", () => {
              it("should revert with error named RandomIpfsNft_SendMoreEth if no eth send", async () => {
                  await expect(randomIpfsNft.requestNFT()).to.be.revertedWith(
                      "RandomIpfsNft_SendMoreEth"
                  )
              })

              it("should emit an event after requesting NFT", async () => {
                  await expect(randomIpfsNft.requestNFT({ value: mintFee.toString() })).to.emit(
                      randomIpfsNft,
                      "Nft_requested"
                  )
              })
          })

          describe("fullfillRandomWords", () => {
              it("should set all values perfectly after minting", async () => {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("Nft_minted", async () => {
                          console.log("event emmitted")
                          try {
                              const counter = await randomIpfsNft.getTokenCounter()
                              const tokenUri = await randomIpfsNft.tokenURI(0)
                              assert.equal(tokenUri.toString().includes("ipfs://"), true)
                              assert.equal(counter.toString(), "1")
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })

                      try {
                          const request = await randomIpfsNft.requestNFT({
                              value: mintFee.toString(),
                          })

                          const responseReciept = await request.wait(1)
                          await vrfCoordinatorV2.fulfillRandomWords(
                              responseReciept.events[1].args.tokenId,
                              randomIpfsNft.address
                          )
                      } catch (error) {
                          console.log(error)
                          reject(error)
                      }
                  })
              })
          })
      })
