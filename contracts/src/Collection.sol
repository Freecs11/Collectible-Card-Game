// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Collection {
  string public name;
  uint256 public cardCount;
  uint256[] public cardIds; // Array to store card IDs

  event CardAdded(uint256 cardId);

  constructor(string memory _name, uint256 _cardCount) {
    name = _name;
    cardCount = _cardCount;
  }

  // Function to add a card to the collection
  function addCard(uint256 cardId) public {
    cardIds.push(cardId);
    emit CardAdded(cardId);
  }

  // Function to retrieve all card IDs in the collection
  function getCardIds() public view returns (uint256[] memory) {
    return cardIds;
  }

  // Function to retrieve the number of cards in the collection
  function getCardCount() public view returns (uint256) {
    return cardIds.length;
  }
}
