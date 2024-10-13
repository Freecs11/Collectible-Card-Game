// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// Ownable used to restrict minting to owner
contract Card is ERC721Enumerable, Ownable {
    // Counter for token IDs
    uint256 private _tokenIds;

    // token ID to card number
    mapping(uint256 => uint256) public cardNumbers;

    // token ID to image URI
    mapping(uint256 => string) public imageURIs;

    // token ID to collection ID
    mapping(uint256 => uint256) public collectionIds;

    constructor(address initialOwner) ERC721("Card", "CARD")  Ownable(initialOwner) {
    }

    // Function to mint a new card
    function mintCard(
        address player,        // Player address
        uint256 cardNumber,    // Card number
        string memory imageURI, // Image URI
        uint256 collectionId   // Collection ID
    ) public onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newCardId = _tokenIds;

        _mint(player, newCardId);

        // Store metadata
        cardNumbers[newCardId] = cardNumber;
        imageURIs[newCardId] = imageURI;
        collectionIds[newCardId] = collectionId;

        return newCardId;
    }

    // Override ERC721Enumerable 
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
