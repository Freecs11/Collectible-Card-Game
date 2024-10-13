// scripts/mint.js
const hre = require('hardhat')


// Mint NFTs and assign them to a user using the Main contract
async function main() {
    // Get the accounts
    const [owner, user1] = await hre.ethers.getSigners()

    const mainContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

    // Get the contract factory and attach to the deployed contract
    const Main = await hre.ethers.getContractFactory('Main')
    const main = await Main.attach(mainContractAddress)

    // Ensure you are connected as the owner
    console.log('Minting NFTs as owner:', owner.address)

    // Check if a collection exists; create one if not
    const totalCollections = await main.getTotalCollections()
    if (totalCollections.eq(0)) {
        const txCreateCollection = await main.createCollection('First Set', 100)
        await txCreateCollection.wait()
        console.log('Collection created')
    } else {
        console.log('Collection already exists')
    }

    // Mint and assign cards to user1
    const cardNumbers = [1, 2, 3] // Card numbers
    const imageURIs = [
        'https://example.com/images/card1.png',
        'https://example.com/images/card2.png',
        'https://example.com/images/card3.png',
    ]

    // Call mintAndAssignMultipleCards
    const txMint = await main.mintAndAssignMultipleCards(
        0, // collectionId
        user1.address, // player address
        cardNumbers,
        imageURIs
    )
    await txMint.wait()
    console.log('Minted and assigned cards to:', user1.address)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error in script:', error)
        process.exit(1)
    })
