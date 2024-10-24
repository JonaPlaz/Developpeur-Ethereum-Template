import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { Cagnotte } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Test Cagnotte", function () {
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  let addr3: HardhatEthersSigner;
  let cagnotte: Cagnotte;
  let goal: bigint;

  // Deployment Fixture
  async function deployCagnotteFixture() {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    let goal = ethers.parseEther("5");
    let cagnotte = await ethers.deployContract("Cagnotte", [goal]);
    return { cagnotte, goal, owner, addr1, addr2, addr3 };
  }

  // Deployment + Ethers given (but goal not reached) Fixture
  async function deployCagnotteEthersGivenGoalNotReachedFixture() {
    const { cagnotte, goal, owner, addr1, addr2, addr3 } = await loadFixture(deployCagnotteFixture);

    let weiQuantity = ethers.parseEther("1");
    await cagnotte.connect(addr1).deposit({ value: weiQuantity });

    weiQuantity = ethers.parseEther("2");
    await cagnotte.connect(addr2).deposit({ value: weiQuantity });

    return { cagnotte, goal, owner, addr1, addr2, addr3 };
  }

  // Deployment + Ethers given (but goal is reached) Fixture
  async function deployCagnotteEthersGivenGoalIsReachedFixture() {
    const { cagnotte, goal, owner, addr1, addr2, addr3 } = await loadFixture(deployCagnotteFixture);

    let weiQuantity = ethers.parseEther("1");
    await cagnotte.connect(addr1).deposit({ value: weiQuantity });

    weiQuantity = ethers.parseEther("2");
    await cagnotte.connect(addr2).deposit({ value: weiQuantity });

    weiQuantity = ethers.parseEther("4");
    await cagnotte.connect(addr2).deposit({ value: weiQuantity });

    return { cagnotte, goal, owner, addr1, addr2, addr3 };
  }

  describe("Initialization", function () {
    it("should NOT deploy the contract if the goal is 0", async function () {
      [owner, addr1, addr2, addr3] = await ethers.getSigners();
      let goal = ethers.parseEther("0"); // still 0
      await expect(ethers.deployContract("Cagnotte", [goal])).to.be.revertedWith("Goal must be greater than 0");
    });

    it("should deploy the smart contract", async function () {
      let { cagnotte, goal, owner, addr1, addr2, addr3 } = await loadFixture(deployCagnotteFixture);
      let theOwner = await cagnotte.owner();
      assert(theOwner === owner.address);
      let theGoal = await cagnotte.goal();
      assert(theGoal === goal);
    });
  });

  describe("Deposit", function () {
    beforeEach(async () => {
      ({ cagnotte, goal, owner, addr1, addr2, addr3 } = await loadFixture(deployCagnotteFixture));
    });

    it("should NOT deposit Ethers on the Cagnotte contract if not enough funds provided", async function () {
      let weiQuantity = ethers.parseEther("0");
      await expect(cagnotte.deposit({ value: weiQuantity })).to.be.rejectedWith("Deposit must be greater than 0");
    });

    it("should deposit ethers on the Cagnotte contract if enough funds are provided", async function () {
      let weiQuantity = ethers.parseEther("1");
      await cagnotte.connect(addr1).deposit({ value: weiQuantity });
      let givenAddr1 = await cagnotte.given(addr1.address);
      console.log(givenAddr1);
      assert(givenAddr1 === weiQuantity);

      weiQuantity = ethers.parseEther("2");
      await cagnotte.connect(addr2).deposit({ value: weiQuantity });
      let givenAddr2 = await cagnotte.given(addr2.address);
      console.log(givenAddr2);
      assert(givenAddr2 === weiQuantity);

      weiQuantity = ethers.parseEther("3.3333333");
      await cagnotte.connect(addr3).deposit({ value: weiQuantity });
      let givenAddr3 = await cagnotte.given(addr3.address);
      console.log(givenAddr3);
      assert(givenAddr3 === weiQuantity);
    });

    it("should deposit ethers on the Cagnotte contract if enough funds are provided and emit an event", async function () {
      let weiQuantity = ethers.parseEther("3.3333333");
      await expect(cagnotte.connect(addr1).deposit({ value: weiQuantity }))
        .to.emit(cagnotte, "Deposit")
        .withArgs(addr1.address, weiQuantity);
    });
  });

  describe("Withdraw", function () {
    it("should NOT withdraw if NOT the owner", async function () {
      let { cagnotte, goal, owner, addr1, addr2, addr3 } = await loadFixture(
        deployCagnotteEthersGivenGoalIsReachedFixture
      );

      await expect(cagnotte.connect(addr1).withdraw())
        .to.be.revertedWithCustomError(cagnotte, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });

    it("should NOT withdraw if the goal is NOT reached", async function () {
      let { cagnotte, goal, owner, addr1, addr2, addr3 } = await loadFixture(
        deployCagnotteEthersGivenGoalNotReachedFixture
      );
      await expect(cagnotte.withdraw()).to.be.revertedWith("Goal not reached");
    });

    it("should withdraw if the goal is reached and if it is the owner who tries to withdraw", async function () {
      let { cagnotte, goal, owner, addr1, addr2, addr3 } = await loadFixture(
        deployCagnotteEthersGivenGoalIsReachedFixture
      );
      let ownerBalanceBeforeWithdraw = await ethers.provider.getBalance(owner.address);
      let contractBalance = await ethers.provider.getBalance(cagnotte.target);

      await expect(cagnotte.withdraw()).to.emit(cagnotte, "Withdrawal").withArgs(owner, contractBalance);

      let ownerBalanceAfterWithdraw = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfterWithdraw).to.be.greaterThan(ownerBalanceBeforeWithdraw);

      /**
       *
       * On pourrait aussi tout à fait calculer très précisément,
       * faire en gros un ownerBalanceAfterWithdraw = ownerBalanceBeforeWithdraw + contractBalance - frais de gas du withdraw
       * Et récupérer les frais de gas en faisant :
       * let transaction = await cagnotte.withdraw()
       * transaction = transaction.wait();
       * Et ici transaction est un objet qui contient les frais de gas qu'a payé le owner pour withdraw.
       */
    });
  });
});
