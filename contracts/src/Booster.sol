// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "./Card.sol";

contract Booster is ERC721Enumerable {
  uint256 private _boosterIds;
  mapping(uint256 => string[]) public boosterCards; // Store card IDs for each booster
  mapping(uint256 => string) public boosterNames; // Store names for each booster

  event BoosterCreated(uint256 boosterId, string[] cardIds, string name);
  event BoosterRedeemed(uint256 boosterId);

  constructor() ERC721("Booster", "BOOST") {}

  function createBooster(
    address player,
    string[] memory cardIds,
    string memory name
  ) external {
    // Mint the booster
    _boosterIds++;
    uint256 newBoosterId = _boosterIds;
    _mint(player, newBoosterId);

    // Store the card IDs for the booster
    boosterCards[newBoosterId] = cardIds;
    boosterNames[newBoosterId] = name;

    emit BoosterCreated(newBoosterId, cardIds, name);
  }

  function redeemBooster(uint256 boosterId) external {
    // check that the booster exists

    _burn(boosterId);
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
}
