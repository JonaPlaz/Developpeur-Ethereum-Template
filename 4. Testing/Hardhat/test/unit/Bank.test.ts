import { expect, assert } from "chai";
import hre from "hardhat";
import { Bank } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Test Bank Contract", function () {
  let deployedContract: Bank;
  let owner: HardhatEthersSigner, addr1: HardhatEthersSigner, addr2: HardhatEthersSigner;

  describe("Initialization", function () {
    beforeEach(async function () {
      [owner, addr1, addr2] = await hre.ethers.getSigners();
      const Bank = await hre.ethers.deployContract("Bank");
      deployedContract = Bank;
    });

    it("Should deploy the contract and get the Owner", async function () {
      let theOwner = await deployedContract.owner(); // Getter to get the owner
      assert(owner.address === theOwner);
    });
  });

  describe("Deposit", function () {
    beforeEach(async function () {
      [owner, addr1, addr2] = await hre.ethers.getSigners();
      const Bank = await hre.ethers.deployContract("Bank");
      deployedContract = Bank;
      console.log(deployedContract.target); // Address of the contract
    });

    it("should NOT deposit Ethers on the Bank contract if NOT the Owner", async function () {
      let weiQuantity = hre.ethers.parseEther("0.1"); // WEI and NOT ETHER should be given to the contract
      console.log(typeof weiQuantity);
      console.log(weiQuantity);

      await expect(deployedContract.connect(addr1).deposit({ value: weiQuantity }))
        .to.be.revertedWithCustomError(deployedContract, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });

    it("should NOT deposit Ethers if not enough funds are provided", async function () {
      let weiQuantity = hre.ethers.parseEther("0.09");
      await expect(deployedContract.deposit({ value: weiQuantity })).to.be.revertedWith("Not enough funds provided");
    });

    it("should deposit Ethers if Owner and if enough funds are provided", async function () {
      let weiQuantity = hre.ethers.parseEther("0.19");
      await expect(deployedContract.connect(owner).deposit({ value: weiQuantity }))
        .to.emit(deployedContract, "Deposit")
        .withArgs(owner.address, weiQuantity);

      let balanceContract = await hre.ethers.provider.getBalance(deployedContract.target);
      assert(balanceContract === weiQuantity);
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      [owner, addr1, addr2] = await hre.ethers.getSigners();
      const Bank = await hre.ethers.deployContract("Bank");
      deployedContract = Bank;

      let weiQuantity = hre.ethers.parseEther("0.19");
      let transaction = await deployedContract.deposit({ value: weiQuantity });
      await transaction.wait(); // === transaction.wait(1);
    });

    it("should not Withdraw if NOT the Owner", async function () {
      let weiQuantity = hre.ethers.parseEther("0.19");
      await expect(deployedContract.connect(addr1).withdraw(weiQuantity))
        .to.be.revertedWithCustomError(deployedContract, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });

    it("should NOT withdraw if the Owner try to withdraw too many Ethers", async function () {
      let weiQuantity = hre.ethers.parseEther("1.66");
      await expect(deployedContract.withdraw(weiQuantity)).to.be.revertedWith("You cannot withdraw this amount");
    });

    it("should withdraw if the owner try to withdraw and the amount is correct", async function () {
      // Déposé 0.19
      let weiQuantity = hre.ethers.parseEther("0.05");
      let expectedBalanceAfterWithdraw = hre.ethers.parseEther("0.14");
      await expect(deployedContract.withdraw(weiQuantity))
        .to.emit(deployedContract, "Withdraw")
        .withArgs(owner.address, weiQuantity);
      let balanceContract = await hre.ethers.provider.getBalance(deployedContract.target);
      assert(balanceContract === expectedBalanceAfterWithdraw); // 0.19 - 0.05 = 0.14
    });
  });
});
