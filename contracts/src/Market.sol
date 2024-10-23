// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Card.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Market is Ownable {
  Card public cardContract;

  struct Listing {
    uint256 cardId;
    address seller;
    uint256 price;
    bool isActive;
  }

  mapping(uint256 => Listing) public listings;

  event CardListed(
    uint256 indexed cardId,
    address indexed seller,
    uint256 price
  );
  event CardSold(uint256 indexed cardId, address indexed buyer, uint256 price);
  event ListingCancelled(uint256 indexed cardId, address indexed seller);

  constructor(address _cardContractAddress, address _owner) Ownable(_owner) {
    cardContract = Card(_cardContractAddress);
  }

  // Function to list a card for sale
  function listCard(uint256 _cardId, uint256 _price) external {
    require(cardContract.ownerOf(_cardId) == msg.sender, "Not the owner");
    require(_price > 0, "Price must be greater than zero");
    require(!listings[_cardId].isActive, "Card is already listed");

    // Transfer the card to the marketplace contract
    cardContract.transferFrom(msg.sender, address(this), _cardId);

    listings[_cardId] = Listing({
      cardId: _cardId,
      seller: msg.sender,
      price: _price,
      isActive: true
    });

    emit CardListed(_cardId, msg.sender, _price);
  }

  // Function to buy a listed card
  function buyCard(uint256 _cardId) external payable {
    Listing storage listing = listings[_cardId];
    require(listing.isActive, "Card is not listed for sale");
    require(msg.value >= listing.price, "Insufficient payment");

    address seller = listing.seller;
    uint256 price = listing.price;

    // **Checks-Effects-Interactions pattern**

    // Effects: Mark the listing as inactive
    listing.isActive = false;

    // Interactions: Transfer the card and funds
    // Transfer the card to the buyer
    cardContract.transferFrom(address(this), msg.sender, _cardId);

    // Transfer funds to the seller
    (bool sent, ) = seller.call{value: price}("");
    require(sent, "Failed to send Ether");

    emit CardSold(_cardId, msg.sender, price);
  }

  // Function to cancel a listing
  function cancelListing(uint256 _cardId) external {
    Listing storage listing = listings[_cardId];
    require(listing.isActive, "Listing is not active");
    require(listing.seller == msg.sender, "Not the seller");

    // Mark the listing as inactive
    listing.isActive = false;

    // Return the card to the seller
    cardContract.transferFrom(address(this), msg.sender, _cardId);

    emit ListingCancelled(_cardId, msg.sender);
  }

  // Function to get all active listings
  function getActiveListings() external view returns (Listing[] memory) {
    uint256 totalListings = cardContract.totalSupply();
    uint256 activeCount = 0;

    // First, count the active listings
    for (uint256 i = 1; i <= totalListings; i++) {
      if (listings[i].isActive) {
        activeCount++;
      }
    }

    // Create an array with the active listings
    Listing[] memory activeListings = new Listing[](activeCount);
    uint256 index = 0;

    for (uint256 i = 1; i <= totalListings; i++) {
      if (listings[i].isActive) {
        activeListings[index] = listings[i];
        index++;
      }
    }

    return activeListings;
  }
}
