import 'dotenv/config';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployer: DeployFunction = async hre => {
  if (hre.network.config.chainId !== 31337) return;
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;
  console.log('Deploying contracts with the account:', deployer);

  // Step 2: Deploy the Main contract
  const mainDeployment = await deploy('Main', {
    from: deployer,
    args: [deployer], // Pass the deployer as the owner
    log: true,
  });
  const mainAddress = mainDeployment.address;
  console.log('Main deployed at:', mainAddress);

  // Step 1: Deploy the Card contract
  const cardDeployment = await deploy('Card', {
    from: deployer,
    args: [mainAddress], // Pass the deployer as the owner
    log: true,
  });
  const cardAddress = cardDeployment.address;
  console.log('Card deployed at:', cardAddress);


  // Step 3: Deploy the Booster contract
  const boosterDeployment = await deploy('Booster', {
    from: deployer,
    args: [], // Pass the deployer as the owner
    log: true,
  });
  const boosterAddress = boosterDeployment.address;
  console.log('Booster deployed at:', boosterAddress);

  // Step 4: Set the Booster contract address in the Main contract
  const mainContract = await ethers.getContractAt('Main', mainAddress);
  await mainContract.setCardContract(cardAddress);
  await mainContract.setBoosterContract(boosterAddress);
  console.log('Booster contract address set in Main contract');


  // Step 5: Deploy the Market contract
  const marketDeployment = await deploy('Market', {
    from: deployer,
    args: [cardAddress , deployer], 
    log: true,
  });
  const marketAddress = marketDeployment.address;
  console.log('Market deployed at:', marketAddress);
};

export default deployer;
