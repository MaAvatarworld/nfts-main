// SPDX-License-Identifier:MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft_SendMoreEth();
error RandomIpfsNft_AlreadyInitialized();
error RangeOutOfBounds();

contract RandomIpfsNft is ERC721URIStorage, VRFConsumerBaseV2, Ownable {
    //enum for random nft
    enum nftBreed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    // randomIpfsNft variables
    mapping(uint256 => address) private s_requestIdToSender;
    uint256 private immutable i_nftPrice;
    uint256 private s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[3] internal s_dogTokenUris;
    bool private s_initialized;

    //vrfCoordinator variables for random words
    VRFCoordinatorV2Interface private immutable i_vrf2Coordinator;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint64 private immutable i_subscriptionId;
    uint32 private constant NUM_WORDS = 1;

    //events
    event Nft_requested(uint256 tokenId, address requester);
    event Nft_minted(nftBreed breed, address requester);

    constructor(
        address vrf2coordinator,
        bytes32 keyHash,
        uint32 callbackGasLimit,
        uint64 subscriptionId,
        uint256 nftPrice,
        string[3] memory dogTokenUris
    ) ERC721("randomIpfsNft", "RINFT") VRFConsumerBaseV2(vrf2coordinator) {
        i_vrf2Coordinator = VRFCoordinatorV2Interface(vrf2coordinator);
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
        i_subscriptionId = subscriptionId;
        i_nftPrice = nftPrice;
        _intializeTokenUris(dogTokenUris);
    }

    function requestNFT() public payable returns (uint256 requestId) {
        if (msg.value < i_nftPrice) {
            revert RandomIpfsNft_SendMoreEth();
        }
        requestId = i_vrf2Coordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit Nft_requested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address dogOwner = s_requestIdToSender[requestId];
        uint256 tokenId = s_tokenCounter;
        s_tokenCounter += 1;
        uint256 modedRange = randomWords[0] % MAX_CHANCE_VALUE;
        nftBreed breed = getBreedFromModedRange(modedRange);
        _safeMint(dogOwner, tokenId);
        _setTokenURI(tokenId, s_dogTokenUris[uint256(breed)]);
        emit Nft_minted(breed, dogOwner);
    }

    function getBreedFromModedRange(uint256 modedRange) public pure returns (nftBreed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getBreedArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (modedRange >= cumulativeSum && modedRange < cumulativeSum + chanceArray[i]) {
                return nftBreed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RangeOutOfBounds();
    }

    function getBreedArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function _intializeTokenUris(string[3] memory dogTokeUris) public {
        if (s_initialized) {
            revert RandomIpfsNft_AlreadyInitialized();
        }
        s_dogTokenUris = dogTokeUris;
        s_initialized = true;
    }

    function getMintFee() public view returns (uint256) {
        return i_nftPrice;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getDogTokenUri(uint256 index) public view returns (string memory) {
        return s_dogTokenUris[index];
    }

    function getInitialized() public view returns (bool) {
        return s_initialized;
    }
}
