// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // Import ERC721 contract
import "@openzeppelin/contracts/utils/Strings.sol"; // Import Strings library

contract Booster is ERC721Enumerable {
  using Strings for uint256;

  uint256 private _boosterIds;
  mapping(uint256 => string[]) public boosterCards;
  mapping(uint256 => string) public boosterNames;

  string private _baseTokenURI;

  event BoosterCreated(
    uint256 boosterId,
    string[] cardIds,
    string name,
    address owner
  );
  event BoosterRedeemed(uint256 boosterId);

  constructor() ERC721("Booster", "BOOST") {
    _boosterIds = 0;
    _baseTokenURI = "https://metadata/"; //
  }

  fallback() external {
    //  handle the unknown function call
  }

  // Override _baseURI to return your base URI
  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  // Override tokenURI to construct the full URI
  function tokenURI(
    uint256 tokenId
  ) public view virtual override returns (string memory) {
    string memory baseURI = _baseURI();
    return
      bytes(baseURI).length > 0
        ? string(abi.encodePacked(baseURI, tokenId.toString()))
        : "";
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  function createBooster(
    address player,
    string[] memory cardIds,
    string memory name
  ) external {
    // Mint the booster
    _boosterIds++;
    uint256 newBoosterId = _boosterIds;
    _mint(player, newBoosterId);

    boosterCards[newBoosterId] = cardIds;
    boosterNames[newBoosterId] = name;

    emit BoosterCreated(newBoosterId, cardIds, name, player);
  }

  function redeemBooster(uint256 boosterId) external {
    _burn(boosterId);
    delete boosterCards[boosterId];
    delete boosterNames[boosterId];

    emit BoosterRedeemed(boosterId);
  }

  function getBoosterCards(
    uint256 boosterId
  ) external view returns (string[] memory, string memory) {
    return (boosterCards[boosterId], boosterNames[boosterId]);
  }

  function getAllBoosters()
    external
    view
    returns (
      uint256[] memory boosterIdResult,
      string[] memory boosterNameResult
    )
  {
    uint256[] memory boosterIds = new uint256[](_boosterIds);
    string[] memory boosterNamesResult = new string[](_boosterIds);

    for (uint256 i = 1; i <= _boosterIds; i++) {
      boosterIds[i - 1] = i;
      boosterNamesResult[i - 1] = boosterNames[i];
    }

    return (boosterIds, boosterNamesResult);
  }

  function getBoostersByPlayer(
    address player
  ) external view returns (uint256[] memory, string[] memory) {
    uint256 balance = balanceOf(player);
    uint256[] memory result = new uint256[](balance);
    string[] memory names = new string[](balance);

    for (uint256 i = 0; i < balance; i++) {
      uint256 tokenId = tokenOfOwnerByIndex(player, i);
      result[i] = tokenId;
      names[i] = boosterNames[tokenId];
    }

    return (result, names);
  }
}
