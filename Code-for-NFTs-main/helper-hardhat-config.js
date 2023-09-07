const networkConfig = {
    default: {
        name: "rinekby",
        keepersUpdateInterval: "30",
        nftPrice: "10000000000000000",
    },
    4: {
        name: "rinkeby",
        subscriptionId: "5979",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
        keepersUpdateInterval: "30",
        callbackGasLimit: "500000", // 500,000 gas
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        nftPrice: "10000000000000000",
    },
    31337: {
        name: "localhost",
        subscriptionId: "5979",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
        keepersUpdateInterval: "30",
        callbackGasLimit: "500000", // 500,000 gas
        nftPrice: "10000000000000000",
    },
}

const developementChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developementChains,
}
