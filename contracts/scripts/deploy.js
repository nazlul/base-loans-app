const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const signers = await hre.ethers.getSigners();
  console.log(signers);


  console.log("Deploying contracts with the account:", deployer.address);

  const ownerAddress = '0x859e52d37CD8B156EcF14E94287B33cE859bC8Df'; 

  const ETHTransfer = await hre.ethers.getContractFactory("ETHTransfer");
  const ethTransfer = await ETHTransfer.deploy(ownerAddress);

  await ethTransfer.deployed();

  console.log("ETHTransfer contract deployed to:", ethTransfer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
