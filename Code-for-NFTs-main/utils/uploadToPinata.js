const path = require("path")
const fs = require("fs")
const pinataSDK = require("@pinata/sdk")
require("dotenv").config()

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET)

async function saveImagesToPinata(imagePath) {
    console.log("uploading images to IPFS...")
    const fullImagePath = path.resolve(imagePath)
    const imageFiles = fs.readdirSync(fullImagePath)
    let responses = []
    for (imageFilesIndex in imageFiles) {
        const readImageFileStream = fs.createReadStream(
            `${fullImagePath}/${imageFiles[imageFilesIndex]}`
        )

        try {
            const response = await pinata.pinFileToIPFS(readImageFileStream)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, imageFiles }
}

async function saveMetadataToPinata(imageTokenMetadata) {
    try {
        const response = await pinata.pinJSONToIPFS(imageTokenMetadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = {
    saveImagesToPinata,
    saveMetadataToPinata,
}
