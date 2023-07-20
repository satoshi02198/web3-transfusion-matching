const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Deploying...");
  const [deployer] = await ethers.getSigners();
  const address = await deployer.getAddress();
  console.log(`Deployer address: ${address}`);

  const transplat = await hre.ethers.getContractFactory("Transfusion");
  console.log("Deploying Transfusion...");
  const contract = await transplat.deploy();
  console.log("🚀 ~ main ~ contract:", contract);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`Contract address: ${contractAddress}`);

  saveContract(contractAddress);
}

function saveContract(contractAddress) {
  const contractDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "app",
    "contracts"
  );

  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir);
  }

  fs.writeFileSync(
    path.join(contractDir, `contract-address-${network.name}.json`),

    JSON.stringify({ Transfusion: contractAddress }, null, 2)
  );

  const TransfusionArtifact = artifacts.readArtifactSync("Transfusion");

  fs.writeFileSync(
    path.join(contractDir, "Transfusion.json"),
    JSON.stringify(TransfusionArtifact, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat run scripts/deploy.js --network localhost
