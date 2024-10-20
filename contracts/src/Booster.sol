// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./Card.sol";

contract Booster is ERC721Enumerable {
  uint256 private _boosterIds;
  mapping(uint256 => string[]) public boosterCards; // Store card IDs for each booster
  mapping(address => uint256[]) public userBoosters; // Store booster IDs owned by each user
  mapping(uint256 => string) public boosterNames; // Store names for each booster
  address public cardContract;

  event BoosterCreated(uint256 boosterId, string[] cardIds, string name);
  event BoosterRedeemed(uint256 boosterId, address player);

  constructor() ERC721("Booster", "BOOST") {}

  function setCardContract(address _cardContract) external {
    cardContract = _cardContract;
  }

  // Function to create a new booster
  function createBooster(
    address player,
    string[] memory cardIds,
    string memory name
  ) public returns (uint256) {
    _boosterIds++;
    uint256 newBoosterId = _boosterIds;

    _mint(player, newBoosterId);
    boosterCards[newBoosterId] = cardIds;
    boosterNames[newBoosterId] = name;
    userBoosters[player].push(newBoosterId);

    emit BoosterCreated(newBoosterId, cardIds, name);

    return newBoosterId;
  }

  // Function to redeem a booster (burns the booster)
  function redeemBooster(uint256 boosterId, address player) public {
    require(ownerOf(boosterId) == player, "Not the owner of the booster");

    // Burn the booster after redeeming
    _burn(boosterId);

    emit BoosterRedeemed(boosterId, player);
  }

  // Function to get booster card IDs
  function getBoosterCards(
    uint256 boosterId
  ) external view returns (string[] memory, string memory) {
    return (boosterCards[boosterId], boosterNames[boosterId]);
  }

  function getBoostersByUser(
    address player
  ) external view returns (uint256[] memory) {
    return userBoosters[player];
  }
}
