// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Collection.sol";
import "./Card.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Main is Ownable {
    uint256 private collectionCount;
    mapping(uint256 => Collection) public collections;
    Card public cardContract;

    event CollectionCreated(uint256 indexed collectionId, string name, uint256 cardCount);
    event CardMinted(uint256 indexed collectionId, uint256 cardId, address player);

    constructor() Ownable(msg.sender) {
        // we deploy a single instance of the Card contract and set the owner to Main
        cardContract = new Card(address(this));
        collectionCount = 0;
    }


    // Function to create a new collection
    // onlyOwner modifier restricts this function to be called only by the owner of the contract
    function createCollection(string calldata name, uint256 cardCount) external onlyOwner {
        Collection newCollection = new Collection(name, cardCount);
        collections[collectionCount] = newCollection;

        emit CollectionCreated(collectionCount, name, cardCount);
        collectionCount++;
    }

    // Function to mint and assign a card to a user in a specified collection
    function mintAndAssignCard(
        uint256 collectionId,
        address player,
        uint256 cardNumber,
        string memory imageURI
    ) external onlyOwner {
        require(collectionId < collectionCount, "Invalid collection ID");
        Collection collection = collections[collectionId];

        uint256 cardId = cardContract.mintCard(
            player,
            cardNumber,
            imageURI,
            collectionId
        );

        collection.addCard(cardId);

        emit CardMinted(collectionId, cardId, player);
    }

    // Function to mint and assign multiple cards to a user from a specified collection
    function mintAndAssignMultipleCards(
        uint256 collectionId,
        address player,
        uint256[] memory cardNumbers,
        string[] memory imageURIs
    ) external onlyOwner { 
        require(collectionId < collectionCount, "Invalid collection ID");
        require(cardNumbers.length == imageURIs.length, "Arrays must be the same length");
        Collection collection = collections[collectionId];

        for (uint256 i = 0; i < cardNumbers.length; i++) {
            uint256 cardId = cardContract.mintCard(
                player,
                cardNumbers[i],
                imageURIs[i],
                collectionId
            );

            collection.addCard(cardId);

            emit CardMinted(collectionId, cardId, player);
        }
    }

    // Function to retrieve collection information
    function getCollection(uint256 collectionId) external view returns (
        string memory name,
        uint256 cardCount,
        uint256[] memory cardIds
    ) {
        require(collectionId < collectionCount, "Invalid collection ID");
        Collection collection = collections[collectionId];

        name = collection.name();
        cardCount = collection.cardCount();
        cardIds = collection.getCardIds();
    }

    // Function to retrieve the total number of collections
    function getTotalCollections() external view returns (uint256) {
        return collectionCount;
    }

    // TEST FUNCTION
    // Function to retrieve all NFTs and their owners from all collections
    // returns two arrays: one with NFT IDs and one with their respective owners
    function getNFTsAndOwnersFromAllCollections() external view returns (uint256[] memory, address[] memory) {
        uint256[] memory nfts = new uint256[](cardContract.totalSupply());
        address[] memory owners = new address[](cardContract.totalSupply());

        for (uint256 i = 0; i < cardContract.totalSupply(); i++) {
            nfts[i] = cardContract.tokenByIndex(i);
            owners[i] = cardContract.ownerOf(nfts[i]);
        }

        return (nfts, owners);
    }


    // Function to retrieve all NFTs done by a specific player
    // returns an array with all NFT IDs owned by the player
    function getNFTsByPlayer(address player) external view returns (uint256[] memory) {
        uint256[] memory nfts = new uint256[](cardContract.balanceOf(player));

        for (uint256 i = 0; i < cardContract.balanceOf(player); i++) {
            nfts[i] = cardContract.tokenOfOwnerByIndex(player, i);
        }

        return nfts;
    }

    
}
