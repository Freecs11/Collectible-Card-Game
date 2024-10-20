// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Card is ERC721Enumerable, Ownable {
  uint256 private _tokenIds;

  mapping(uint256 => string) public cardIds;
  mapping(uint256 => uint256) public cardNumbers;
  mapping(uint256 => string) public imageURIs;
  mapping(uint256 => uint256) public cardCollection;

  constructor(
    address initialOwner
  ) ERC721("Card", "CARD") Ownable(initialOwner) {}

  function mintCard(
    address player,
    string memory cardId,
    uint256 cardNumber,
    string memory imageURI
  ) public onlyOwner returns (uint256) {
    _tokenIds++;
    uint256 newCardId = _tokenIds;

    _mint(player, newCardId);

    cardIds[newCardId] = cardId;
    cardNumbers[newCardId] = cardNumber;
    imageURIs[newCardId] = imageURI;

    return newCardId;
  }

  function setCardCollection(
    uint256 cardId,
    uint256 collectionId
  ) public onlyOwner {
    cardCollection[cardId] = collectionId;
  }
}
