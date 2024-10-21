const hre = require("hardhat");

async function main() {

    // récuperation du contrat
    const Sstorage = await ethers.getContractFactory('Storage');

    // connexion au contrat déployé
    const storage = Sstorage.attach("0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e");

  let number = await storage.retrieve()
  console.log('Default number : ' + number.toString())

  await storage.store(80)

  number = await storage.retrieve()
  console.log('Updated number : ' + number.toString())


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});