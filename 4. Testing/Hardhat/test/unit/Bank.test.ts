import { expect, assert } from "chai";
import hre from "hardhat";
import { Bank } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

let deployedContract: Bank;
let owner, addr1, addr2: HardhatEthersSigner;

describe("Test Bank Contract", function () {
  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    const Bank = await hre.ethers.deployContract("Bank");
    deployedContract = Bank;
  });

  describe("Initialization", function () {
    
  });
});
