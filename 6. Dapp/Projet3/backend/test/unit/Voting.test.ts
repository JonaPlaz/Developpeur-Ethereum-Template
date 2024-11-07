import { expect, assert } from "chai";
import hre from "hardhat";
import { Voting } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

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

async function deployVotingFixture() {
  [owner, addr1, addr2] = await hre.ethers.getSigners();
  const Voting = await hre.ethers.deployContract("Voting");
  deployedContract = Voting;
  return { deployedContract, owner, addr1, addr2 };
}

describe("Test Voting Contract", function () {
  beforeEach(async function () {
    await loadFixture(deployVotingFixture);
  });

  describe("Get voter", function () {
    it("Should revert if voter is not registered", async function () {
      await expect(deployedContract.getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
    });
    it("Should confirm voter is registered", async function () {
      await deployedContract.connect(owner).addVoter(owner.address);
      await deployedContract.connect(owner).addVoter(addr1.address);
      const voter = await deployedContract.getVoter(addr1.address);
      expect(voter.isRegistered).to.equal(true);
    });
  });

  describe("Get One Proposal", function () {
    it("Should revert if voter is not registered", async function () {
      await expect(deployedContract.getOneProposal(1)).to.be.revertedWith("You're not a voter");
    });
    it("Should return défault proposal is GENESIS", async function () {
      await deployedContract.addVoter(owner.address);
      await deployedContract.startProposalsRegistering();
      const proposal = await deployedContract.getOneProposal(0);
      expect(proposal.description).to.equal("GENESIS");
    });
    it("Should return the correct proposal", async function () {
      await deployedContract.addVoter(owner.address);
      await deployedContract.startProposalsRegistering();
      await deployedContract.addProposal("Proposal 1");
      const proposal = await deployedContract.getOneProposal(1);
      expect(proposal.description).to.equal("Proposal 1");
      expect(proposal.voteCount).to.equal(0);
    });
    it("Should revert if the proposal ID does not exist", async function () {
      await deployedContract.addVoter(owner.address);
      await deployedContract.startProposalsRegistering();
      await expect(deployedContract.getOneProposal(999)).to.be.reverted;
    });
  });

  describe("Add voter", function () {
    // n'améliore pas le coverage, laissé pour l'exemple
    it("Should add voter without reverting when called by the owner", async function () {
      await expect(deployedContract.connect(owner).addVoter(addr1.address)).to.not.be.reverted;
    });
    it("Should revert if a non-owner tries to add a voter", async function () {
      await expect(deployedContract.connect(addr1).addVoter(addr2.address)).to.be.revertedWithCustomError(
        deployedContract,
        "OwnableUnauthorizedAccount"
      );
    });
    it("Should revert if status is not equal to RegisteringVoters", async function () {
      await deployedContract.startProposalsRegistering();
      await expect(deployedContract.connect(owner).addVoter(addr1.address)).to.be.revertedWith(
        "Voters registration is not open yet"
      );
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
      await expect(deployedContract.addProposal("Proposal 1")).to.be.revertedWith("You're not a voter");
    });
    it("Should revert if workflow status is not ProposalsRegistrationStarted", async function () {
      await deployedContract.connect(owner).addVoter(addr1.address);
      await expect(deployedContract.connect(addr1).addProposal("Proposal 1")).to.be.revertedWith(
        "Proposals are not allowed yet"
      );
    });
    it("Should revert if proposal is empty string", async function () {
      await deployedContract.connect(owner).addVoter(addr1.address);
      await deployedContract.startProposalsRegistering();
      await expect(deployedContract.connect(addr1).addProposal("")).to.be.revertedWith(
        "Vous ne pouvez pas ne rien proposer"
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
      await expect(deployedContract.setVote(0)).to.be.revertedWith("You're not a voter");
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
    it("Should revert if _id < proposalsArray length", async function () {
      await deployedContract.connect(owner).addVoter(addr1.address);
      await deployedContract.startProposalsRegistering();
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await expect(deployedContract.connect(addr1).setVote(1)).to.be.revertedWith("Proposal not found");
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
    it("Should revert if a non-owner tries to add a voter", async function () {
      await expect(deployedContract.connect(addr1).startProposalsRegistering()).to.be.revertedWithCustomError(
        deployedContract,
        "OwnableUnauthorizedAccount"
      );
    });
    it("Should revert if status is not equal to RegisteringVoters", async function () {
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
      await deployedContract.connect(owner).startVotingSession();
      await expect(deployedContract.connect(owner).endVotingSession())
        .to.emit(deployedContract, "WorkflowStatusChange")
        .withArgs(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    });
  });

  describe("Tally votes", function () {
    it("Should revert if a non-owner tries to add a voter", async function () {
      await expect(deployedContract.connect(addr1).tallyVotes()).to.be.revertedWithCustomError(
        deployedContract,
        "OwnableUnauthorizedAccount"
      );
    });
    it("Should revert if status is not equal to VotingSessionEnded", async function () {
      await expect(deployedContract.connect(owner).tallyVotes()).to.be.revertedWith(
        "Current status is not voting session ended"
      );
    });
    it("Should emit WorkflowStatusChange event", async function () {
      await deployedContract.startProposalsRegistering();
      await deployedContract.endProposalsRegistering();
      await deployedContract.connect(owner).startVotingSession();
      await deployedContract.connect(owner).endVotingSession();
      await expect(deployedContract.connect(owner).tallyVotes())
        .to.emit(deployedContract, "WorkflowStatusChange")
        .withArgs(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    });
    it("Should select the proposal with the most votes", async function () {
      await deployedContract.addVoter(owner.address);
      await deployedContract.addVoter(addr1.address);
      await deployedContract.addVoter(addr2.address);
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(owner).addProposal("Proposal 1");
      await deployedContract.connect(addr1).addProposal("Proposal 2");
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await deployedContract.connect(owner).setVote(0);
      await deployedContract.connect(addr1).setVote(1);
      await deployedContract.connect(addr2).setVote(1);
      await deployedContract.endVotingSession();
      await deployedContract.tallyVotes();
      const winningProposalID = await deployedContract.winningProposalID();
      expect(winningProposalID).to.equal(1);
    });
    it("Should select GENESIS (id : 0) if no votes", async function () {
      await deployedContract.addVoter(owner.address);
      await deployedContract.addVoter(addr1.address);
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(owner).addProposal("Proposal 1");
      await deployedContract.connect(addr1).addProposal("Proposal 2");
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await deployedContract.endVotingSession();
      await deployedContract.tallyVotes();
      const winningProposalID = await deployedContract.winningProposalID();
      expect(winningProposalID).to.equal(0);
    });
  });
});
