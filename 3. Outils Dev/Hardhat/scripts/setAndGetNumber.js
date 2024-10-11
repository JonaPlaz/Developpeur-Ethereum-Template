const hre = require("hardhat");

async function main() {
    const simpleStorage = await ethers.getContractFactory('SimpleStorage')
    const contract = simpleStorage.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3")
    let number = await contract.getNumber()
    console.log('Default number : ' + number.toString())
    await contract.setNumber(3)
    number = await contract.getNumber()
    console.log('Updated number : ' + number.toString())
} main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});