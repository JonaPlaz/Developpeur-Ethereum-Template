const hre = require("hardhat");

async function main() {
    const storageAmount = hre.ethers.parseEther("0.0000001");
    const storageNumber = 12;

    const storage = await hre.ethers.deployContract("Storage", [storageNumber], {
        value: storageAmount,
    });

    await storage.waitForDeployment();

    console.log(
        `Storage with ${ethers.formatEther(
            storageAmount
        )} and number ${storageNumber} deployed to ${storage.target}`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});