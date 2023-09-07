// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicPugNft is ERC721 {
    uint256 private s_tokenCounter;
    string private constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    constructor() ERC721("Dogie", "PUG") {
        s_tokenCounter = 0;
    }

    // mint the nft
    function mintNFT() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        return s_tokenCounter;
    }

    // getter functions
    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function tokenURI(uint256 tokenId) public pure override returns (string memory) {
        return TOKEN_URI;
    }
}
