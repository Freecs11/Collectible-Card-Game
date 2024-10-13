const { expect } = require("chai");
const { ethers } = require("hardhat");

// Test suite for the Main contract
describe("Main Contract", function () {
  let Main;
  let main;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Main = await ethers.getContractFactory("Main");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    main = await Main.deploy();
    await main.deployed();
    console.log("Contract deployed");
  });

  it("Should mint and assign cards to users and retrieve their NFTs", async function () {
    console.log("Test started");
    await main.createCollection("First Collection", 10);
    console.log("Collection created");
    
    await main.mintAndAssignCard(0, addr1.address, "tokenURI1");
    console.log("Card 1 minted");
    await main.mintAndAssignCard(0, addr1.address, "tokenURI2");
    console.log("Card 2 minted");
    await main.mintAndAssignCard(0, addr2.address, "tokenURI3");
    console.log("Card 3 minted");

    const addr1NFTs = await main.getNFTsOwnedByUser(addr1.address);
    const addr2NFTs = await main.getNFTsOwnedByUser(addr2.address);

    console.log("addr1 NFTs:", addr1NFTs);
    console.log("addr2 NFTs:", addr2NFTs);

    expect(addr1NFTs).to.have.lengthOf(2);
    expect(addr1NFTs[0]).to.equal(1);
    expect(addr1NFTs[1]).to.equal(2);

    expect(addr2NFTs).to.have.lengthOf(1);
    expect(addr2NFTs[0]).to.equal(3);
  });
});