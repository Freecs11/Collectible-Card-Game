// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Collection.sol";
import "./Card.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Booster.sol";

contract Main is Ownable {
  uint256 public collectionCount;
  mapping(uint256 => Collection) public collections;
  Card public cardContract;
  Booster public boosterContract;

  // Mapping to track registered users
  // mapping(address => bool) private registeredUsers;
  // address[] private userAddresses;

  event UserRegistered(address user);

  event CollectionCreated(
    uint256 indexed collectionId,
    string name,
    uint256 cardCount
  );
  event CardMinted(
    uint256 indexed collectionId,
    uint256 cardId,
    address player
  );

  constructor(address _owner) Ownable(_owner) {
    // cardContract = Card(_cardContract);
    // boosterContract = new Booster(_owner, address(cardContract));
  }

  // erreur rencontré de 'Contract'#<unrecognized-selector> ...
  // see https://github.com/MetaMask/metamask-extension/issues/14963
  // & https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/315 for more details
  // * receive function
  receive() external payable {}

  // * fallback function
  fallback() external payable {}

  // Function to set the Card contract address in the Main contract
  function setCardContract(address _cardAddress) external onlyOwner {
    cardContract = Card(_cardAddress);
  }

  // Function to set the Booster contract address in the Main contract
  function setBoosterContract(address _boosterAddress) external onlyOwner {
    boosterContract = Booster(_boosterAddress);
  }

  // Simplify registerUser function
  function registerUser(address user) external {
    emit UserRegistered(user);
  }

  // Function to create a new collection
  // onlyOwner modifier restricts this function to be called only by the owner of the contract
  function createCollection(
    string calldata name,
    uint256 cardCount
  ) external onlyOwner {
    Collection newCollection = new Collection(name, cardCount);
    collections[collectionCount] = newCollection;

    emit CollectionCreated(collectionCount, name, cardCount);
    collectionCount++;
  }

  // Function to mint and assign a card to a user in a specified collection
  function mintAndAssignCard(
    uint256 collectionId,
    address player,
    string memory cardIds,
    uint256 cardNumber,
    string memory imageURI
  ) public onlyOwner returns (uint256) {
    require(collectionId < collectionCount, "Invalid collection ID");
    Collection collection = collections[collectionId];

    uint256 cardId = cardContract.mintCard(
      player,
      cardIds,
      cardNumber,
      imageURI
    );
    cardContract.setCardCollection(cardId, collectionId);
    collection.addCard(cardId);

    emit CardMinted(collectionId, cardId, player);

    return cardId;
  }

  // Function to mint and assign multiple cards to a user from a specified collection
  function mintAndAssignMultipleCards(
    uint256 collectionId,
    address player,
    string[] memory cardIds,
    uint256[] memory cardNumbers,
    string[] memory imageURIs
  ) external onlyOwner {
    require(collectionId < collectionCount, "Invalid collection ID");
    require(
      cardNumbers.length == imageURIs.length,
      "Arrays must be the same length"
    );
    Collection collection = collections[collectionId];

    for (uint256 i = 0; i < cardNumbers.length; i++) {
      uint256 cardId = cardContract.mintCard(
        player,
        cardIds[i],
        cardNumbers[i],
        imageURIs[i]
      );

      cardContract.setCardCollection(cardId, collectionId);

      collection.addCard(cardId);

      emit CardMinted(collectionId, cardId, player);
    }
  }

  // Function to retrieve collection information
  function getCollection(
    uint256 collectionId
  )
    external
    view
    returns (string memory name, uint256 cardCount, uint256[] memory cardIds)
  {
    require(collectionId < collectionCount, "Invalid collection ID");
    Collection collection = collections[collectionId];

    name = collection.name();
    cardCount = collection.cardCount();
    cardIds = collection.getCardIds();
  }

  // get collection by card id
  function getCollectionByCardId(
    uint256 cardId
  ) external view returns (string memory collectionName) {
    // get collection id
    uint256 collectionId = cardContract.cardCollection(cardId);
    Collection collection = collections[collectionId];
    collectionName = collection.name();
  }

  // Function to retrieve the total number of collections
  function getTotalCollections() external view returns (uint256) {
    return collectionCount;
  }

  // TEST FUNCTION
  // Function to retrieve all NFTs and their owners from all collections
  // returns two arrays: one with NFT IDs and one with their respective owners
  function getNFTsAndOwnersFromAllCollections()
    external
    view
    returns (uint256[] memory, address[] memory)
  {
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
  function getNFTsByPlayer(
    address player
  ) external view returns (uint256[] memory) {
    uint256[] memory nfts = new uint256[](cardContract.balanceOf(player));

    for (uint256 i = 0; i < cardContract.balanceOf(player); i++) {
      nfts[i] = cardContract.tokenOfOwnerByIndex(player, i);
    }

    return nfts;
  }

  // function to get the metadata of a card by its ID
  function getCardMetadata(
    uint256 cardId
  )
    external
    view
    returns (
      string memory cardIds,
      uint256 cardNumber,
      string memory imageURI,
      uint256 collectionId
    )
  {
    cardIds = cardContract.cardIds(cardId);
    cardNumber = cardContract.cardNumbers(cardId);
    imageURI = cardContract.imageURIs(cardId);
    collectionId = cardContract.cardCollection(cardId);
  }

  // Function to get all collections' details
  function getAllCollections()
    external
    view
    returns (uint256[] memory, string[] memory, uint256[] memory)
  {
    uint256[] memory ids = new uint256[](collectionCount);
    string[] memory names = new string[](collectionCount);
    uint256[] memory cardCounts = new uint256[](collectionCount);

    for (uint256 i = 0; i < collectionCount; i++) {
      Collection collection = collections[i];
      ids[i] = i;
      names[i] = collection.name();
      cardCounts[i] = collection.cardCount();
    }

    return (ids, names, cardCounts);
  }

  // Booster contract functions
  // Function to create a booster for a player with random cards from a collection
  function createBoosterForPlayer(
    address player,
    string[] memory cardIds,
    string memory boosterName
  ) external {
    // check that it's 0.01wei per booster
    boosterContract.createBooster(player, cardIds, boosterName);
  }

  // getBoosterCards
  function getBoosterCards(
    uint256 boosterId
  ) external view returns (string[] memory cardIds, string memory name) {
    return boosterContract.getBoosterCards(boosterId);
  }

  function redeemBoosterAndCreateCollection(
    uint256 boosterId,
    address player,
    string memory collectionName,
    string[] memory cardIds,
    uint256[] memory cardNumbers,
    string[] memory imageURIs
  ) external payable {
    require(msg.value == 0.01 ether, "Invalid value");

    // Create a new collection
    Collection newCollection = new Collection(collectionName, cardIds.length);
    collections[collectionCount] = newCollection;

    // Mint and assign multiple cards to the player
    for (uint256 i = 0; i < cardIds.length; i++) {
      uint256 cardId = cardContract.mintCard(
        player,
        cardIds[i],
        cardNumbers[i],
        imageURIs[i]
      );
      cardContract.setCardCollection(cardId, collectionCount);
      newCollection.addCard(cardId);
    }

    collectionCount++;

    // Redeem the booster
    boosterContract.redeemBooster(boosterId);
  }

  // Function to get all boosters with their prices and names
  function getAllBoosters()
    external
    view
    returns (
      uint256[] memory boosterIdResult,
      string[] memory boosterNameResult
    )
  {
    return boosterContract.getAllBoosters();
  }

  // Function to get all boosters of a player
  function getBoostersByPlayer(
    address player
  ) external view returns (uint256[] memory, string[] memory) {
    return boosterContract.getBoostersByPlayer(player);
  }
}
