import { expect, assert } from "chai";
import hre from "hardhat";
import { SimpleStorage } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

let deployedContract: SimpleStorage;
let owner, addr1, addr2: HardhatEthersSigner;

describe("Test SimpleStorage Contract", function () {
  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    const SimpleStorage = await hre.ethers.deployContract("SimpleStorage");
    deployedContract = SimpleStorage;
  });

  describe("Initialization", function () {
    it("Should get the number and the number should be equal to 0", async function () {
      let storedData = await deployedContract.retrieve();
      assert(Number(storedData) == 0);
    });
  });

  describe("Set and Get", function () {
    it("Should set the number and get an updated number", async function () {
      let transaction = await deployedContract.store(777);
      await transaction.wait(); // +On attend un bloc
      let storedData = await deployedContract.retrieve();
      assert(Number(storedData) == 777);
    });
  });
});
