// scripts/mint.js
const hre = require('hardhat');

async function main() {
    // Get the accounts
    const [owner] = await hre.ethers.getSigners();

    const mainContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Update this if needed

    // Get the contract factory and attach to the deployed contract
    const Main = await hre.ethers.getContractFactory('Main');
    const main = await Main.attach(mainContractAddress);

    // Ensure you are connected as the owner
    console.log('Minting NFTs as owner:', owner.address);

    // Get total collections from the contract
    const totalCollections = await main.getTotalCollections();

    let collectionId;

    if (totalCollections.eq(0)) {
        // Create a collection
        const txCreateCollection = await main.createCollection('First Collection', 10);
        await txCreateCollection.wait();
        console.log('Collection created');
        collectionId = 0;
    } else {
        // Use existing collection
        collectionId = totalCollections.sub(1);
        console.log('Using existing collection with ID:', collectionId.toString());
    }

    // The address you want to mint to
    const playerAddress = '0x0cdb365aa09537ebd0ee98037753ac0114177490'; // Your frontend address

    // Card numbers and image URIs
    const cardNumbers = [6, 7, 8]; // Card numbers
    const imageURIs = [
        'https://example.com/images/card1.png',
        'https://example.com/images/card2.png',
        'https://example.com/images/card3.png',
    ];

    // Call mintAndAssignMultipleCards
    const txMint = await main.mintAndAssignMultipleCards(
        collectionId,
        playerAddress,
        cardNumbers,
        imageURIs
    );
    await txMint.wait();
    console.log('Minted and assigned cards to:', playerAddress);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error in script:', error);
        process.exit(1);
    });
