// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

contract DynamicSvgNft is ERC721, Ownable {
    string private s_lowSvgURI;
    string private s_highSvgURI;
    string private s_lowImage;
    uint256 private s_tokenCounter;
    mapping(uint256 => int256) private s_tokeIdToHighValues;

    AggregatorV3Interface private immutable i_priceFeed;

    constructor(
        string memory lowSVG,
        string memory highSVG,
        address AggregatorV3Address
    ) ERC721("DynamicSvgNft", "DSN") {
        s_lowSvgURI = svgToImageURI(lowSVG);
        s_highSvgURI = svgToImageURI(highSVG);
        i_priceFeed = AggregatorV3Interface(AggregatorV3Address);
    }

    event NFTCreated(address reciever, uint256 tokenId, int256 highValue);

    function mintNFT(int256 highValue) public {
        s_tokeIdToHighValues[s_tokenCounter] = highValue;
        emit NFTCreated(msg.sender, s_tokenCounter, highValue);
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory encodedSVGImage = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(baseURL, encodedSVGImage));
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "TokenMetadata: query for non existent data");
        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        string memory imageURI = s_lowSvgURI;
        if (price > s_tokeIdToHighValues[tokenId]) {
            imageURI = s_highSvgURI;
        }

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '","description": "An NFT that changes based on the chainlink priceFeed","',
                                'attributes": [{"trait_type": "coolness", "value": 100}],"image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getLowSvgURI() public view returns (string memory) {
        return s_lowSvgURI;
    }

    function getHighSvgURI() public view returns (string memory) {
        return s_highSvgURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }
}
