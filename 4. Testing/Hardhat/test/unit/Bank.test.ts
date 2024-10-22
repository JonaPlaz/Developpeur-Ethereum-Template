import { expect, assert } from "chai";
import hre from "hardhat";
import { Bank } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

let deployedContract: Bank;
let owner: HardhatEthersSigner, addr1: HardhatEthersSigner, addr2: HardhatEthersSigner;

describe("Test Bank Contract", function () {
  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    const Bank = await hre.ethers.deployContract("Bank");
    deployedContract = Bank;
  });

  describe("Deposit", function () {
    it("Require if enough funds provided", async function () {
      await expect(deployedContract.deposit({ value: hre.ethers.parseEther("0.05") })).to.be.revertedWith(
        "Not enough funds provided"
      );
    });
    it("Should emit Deposit event", async function () {
      await expect(deployedContract.deposit({ value: hre.ethers.parseEther("0.2") }))
        .to.emit(deployedContract, "Deposit")
        .withArgs(owner.address, hre.ethers.parseEther("0.2"));
    });
  });

  describe("Withdraw", function () {
    it("Require if you can withdraw this amount", async function () {
      await deployedContract.deposit({ value: hre.ethers.parseEther("0.2") });
      await expect(deployedContract.withdraw(hre.ethers.parseEther("1"))).to.be.revertedWith(
        "You cannot withdraw this amount"
      );
    });
    it("Should emit Withdraw event", async function () {
      await deployedContract.deposit({ value: hre.ethers.parseEther("2") });
      await expect(deployedContract.withdraw(hre.ethers.parseEther("1")))
        .to.emit(deployedContract, "Withdraw")
        .withArgs(owner.address, hre.ethers.parseEther("1"));
    });
  });
});
