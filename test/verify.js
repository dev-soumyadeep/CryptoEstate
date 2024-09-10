const hre = require("hardhat");

async function main() {
  const contractAddress = "0xf95eD1ddff321AF71EF5e53E9722e85784409875";
  const constructorArgs = ["0xe05e01f4f8a7b9b18bCb46C52835f739A13827f8"];

  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: constructorArgs,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
