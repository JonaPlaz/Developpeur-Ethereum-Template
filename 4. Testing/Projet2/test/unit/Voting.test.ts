import { expect, assert } from "chai";
import hre from "hardhat";
import { Voting } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

let deployedContract: Voting;
let owner: HardhatEthersSigner, addr1: HardhatEthersSigner, addr2: HardhatEthersSigner;

enum WorkflowStatus {
  RegisteringVoters = 0,
  ProposalsRegistrationStarted = 1,
  ProposalsRegistrationEnded = 2,
  VotingSessionStarted = 3,
  VotingSessionEnded = 4,
  VotesTallied = 5,
}

let workflowStatus: WorkflowStatus;

describe("Test Voting Contract", function () {
  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    const Voting = await hre.ethers.deployContract("Voting");
    deployedContract = Voting;
  });

  describe("Get voters", function () {
    it("Should revert if voter is not registered", async function () {
      await expect(deployedContract.getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
    });
  });

  describe("Add voter", function () {
    it("Should add voter without reverting when called by the owner", async function () {
      await expect(deployedContract.connect(owner).addVoter(addr1.address)).to.not.be.reverted;
    });
    it("Should revert if a non-owner tries to add a voter", async function () {
      await expect(deployedContract.connect(addr1).addVoter(addr2.address)).to.be.revertedWithCustomError(
        deployedContract,
        "OwnableUnauthorizedAccount"
      );
    });
    it("Should status equal to RegisteringVoters", async function () {
      let status = await deployedContract.workflowStatus();
      expect(status).to.equal(WorkflowStatus.RegisteringVoters);
    });
    it("Should revert if status is not equal to RegisteringVoters", async function () {
      // change status
      await deployedContract.startProposalsRegistering();
      await expect(deployedContract.connect(owner).addVoter(addr1.address)).to.be.revertedWith(
        "Voters registration is not open yet"
      );
    });
    it("Should voter is registered", async function () {
      await deployedContract.connect(owner).addVoter(owner.address);
      await deployedContract.connect(owner).addVoter(addr1.address);
      const voter = await deployedContract.getVoter(addr1.address);
      expect(voter.isRegistered).to.be.true;
    });
    it("Should revert because voter is already registered", async function () {
      await deployedContract.connect(owner).addVoter(owner.address);
      await deployedContract.connect(owner).addVoter(addr1.address);
      await expect(deployedContract.connect(owner).addVoter(addr1.address)).to.be.revertedWith("Already registered");
    });
    it("Should emit VoterRegistered event", async function () {
      await expect(deployedContract.connect(owner).addVoter(owner.address))
        .to.emit(deployedContract, "VoterRegistered")
        .withArgs(owner.address);
    });
  });

  describe("Add proposal", function () {
    it("Should revert if voter is not registered", async function () {
      await expect(deployedContract.getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
    });
    it("Should revert if workflow status is not ProposalsRegistrationStarted", async function () {
      await deployedContract.connect(owner).addVoter(addr1.address);
      await expect(deployedContract.connect(addr1).addProposal("Proposal 1")).to.be.revertedWith(
        "Proposals are not allowed yet"
      );
    });
    it("Should emit ProposalRegistered event", async function () {
      await deployedContract.connect(owner).addVoter(addr1.address);
      await deployedContract.startProposalsRegistering();
      await expect(deployedContract.connect(addr1).addProposal("Proposal 1")).to.emit(
        deployedContract,
        "ProposalRegistered"
      );
    });
  });

  describe("Set vote", function () {
    it("Should revert if voter is not registered", async function () {
      await expect(deployedContract.getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
    });
    it("Should revert if workflow status is not VotingSessionStarted", async function () {
      await deployedContract.connect(owner).addVoter(addr1.address);
      await expect(deployedContract.connect(addr1).setVote(0)).to.be.revertedWith("Voting session havent started yet");
    });
    it("Should revert if voter has already voted", async function () {
      await deployedContract.connect(owner).addVoter(addr1.address);
      await deployedContract.startProposalsRegistering();
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await deployedContract.connect(addr1).setVote(0);
      await expect(deployedContract.connect(addr1).setVote(0)).to.be.revertedWith("You have already voted");
    });
    it("Should emit Voted event", async function () {
      await deployedContract.connect(owner).addVoter(addr1.address);
      await deployedContract.startProposalsRegistering();
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await expect(deployedContract.connect(addr1).setVote(0)).to.emit(deployedContract, "Voted");
    });
  });

  describe("Start Proposals Registering", function () {
    it("Should update status without reverting when called by the owner", async function () {
      await expect(deployedContract.connect(owner).startProposalsRegistering()).to.not.be.reverted;
    });
    it("Should revert if a non-owner tries to add a voter", async function () {
      await expect(deployedContract.connect(addr1).startProposalsRegistering()).to.be.revertedWithCustomError(
        deployedContract,
        "OwnableUnauthorizedAccount"
      );
    });
    it("Should revert if status is not equal to RegisteringVoters", async function () {
      // change status
      await deployedContract.startProposalsRegistering();
      await expect(deployedContract.connect(owner).startProposalsRegistering()).to.be.revertedWith(
        "Registering proposals cant be started now"
      );
    });
    it("Should emit WorkflowStatusChange event", async function () {
      await expect(deployedContract.connect(owner).startProposalsRegistering())
        .to.emit(deployedContract, "WorkflowStatusChange")
        .withArgs(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    });
  });

  describe("End Proposals Registering", function () {
    it("Should update status without reverting when called by the owner", async function () {
      await deployedContract.startProposalsRegistering();
      await expect(deployedContract.connect(owner).endProposalsRegistering()).to.not.be.reverted;
    });
    it("Should revert if a non-owner tries to add a voter", async function () {
      await expect(deployedContract.connect(addr1).endProposalsRegistering()).to.be.revertedWithCustomError(
        deployedContract,
        "OwnableUnauthorizedAccount"
      );
    });
    it("Should revert if status is not equal to ProposalsRegistrationStarted", async function () {
      await expect(deployedContract.connect(owner).endProposalsRegistering()).to.be.revertedWith(
        "Registering proposals havent started yet"
      );
    });
    it("Should emit WorkflowStatusChange event", async function () {
      await deployedContract.startProposalsRegistering();
      await expect(deployedContract.connect(owner).endProposalsRegistering())
        .to.emit(deployedContract, "WorkflowStatusChange")
        .withArgs(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    });
  });

  describe("Start Voting Session", function () {
    it("Should update status without reverting when called by the owner", async function () {
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(owner).endProposalsRegistering();
      await expect(deployedContract.connect(owner).startVotingSession()).to.not.be.reverted;
    });
    it("Should revert if a non-owner tries to add a voter", async function () {
      await expect(deployedContract.connect(addr1).startVotingSession()).to.be.revertedWithCustomError(
        deployedContract,
        "OwnableUnauthorizedAccount"
      );
    });
    it("Should revert if status is not equal to ProposalsRegistrationEnded", async function () {
      await expect(deployedContract.connect(owner).startVotingSession()).to.be.revertedWith(
        "Registering proposals phase is not finished"
      );
    });
    it("Should emit WorkflowStatusChange event", async function () {
      await deployedContract.startProposalsRegistering();
      await deployedContract.endProposalsRegistering();
      await expect(deployedContract.connect(owner).startVotingSession())
        .to.emit(deployedContract, "WorkflowStatusChange")
        .withArgs(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    });
  });

  describe("End Voting Session", function () {
    it("Should update status without reverting when called by the owner", async function () {
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(owner).endProposalsRegistering();
      await deployedContract.connect(owner).startVotingSession();
      await expect(deployedContract.connect(owner).endVotingSession()).to.not.be.reverted;
    });
    it("Should revert if a non-owner tries to add a voter", async function () {
      await expect(deployedContract.connect(addr1).endVotingSession()).to.be.revertedWithCustomError(
        deployedContract,
        "OwnableUnauthorizedAccount"
      );
    });
    it("Should revert if status is not equal to VotingSessionStarted", async function () {
      await expect(deployedContract.connect(owner).endVotingSession()).to.be.revertedWith(
        "Voting session havent started yet"
      );
    });
    it("Should emit WorkflowStatusChange event", async function () {
      await deployedContract.startProposalsRegistering();
      await deployedContract.endProposalsRegistering();
      deployedContract.connect(owner).startVotingSession();
      await expect(deployedContract.connect(owner).endVotingSession())
        .to.emit(deployedContract, "WorkflowStatusChange")
        .withArgs(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    });
  });
});
