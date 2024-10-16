const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const signers = await hre.ethers.getSigners();
  console.log(signers);


  console.log("Deploying contracts with the account:", deployer.address);

  const ETHTransfer = await hre.ethers.getContractFactory("ETHTransfer");
  const ethTransfer = await ETHTransfer.deploy();

  await ethTransfer.deployed();

  console.log("ETHTransfer contract deployed to:", ethTransfer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
