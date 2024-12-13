const hre = require("hardhat");

async function main() {
  const VideoAuthentication = await hre.ethers.getContractFactory("VideoAuthentication");
  const videoAuth = await VideoAuthentication.deploy();

  await videoAuth.waitForDeployment();
  
  const address = await videoAuth.getAddress();
  console.log("VideoAuthentication deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});