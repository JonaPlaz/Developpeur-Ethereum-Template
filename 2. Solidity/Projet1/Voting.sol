// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    constructor() Ownable(msg.sender) {}

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    struct Proposal {
        string description;
        uint256 voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    uint256 private winningProposalId;

    WorkflowStatus private currentStatus;

    mapping(address => Voter) private whitelist;

    Proposal[] private proposalList;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );
    event ProposalRegistered(uint256 proposalId);
    event Voted(address voter, uint256 proposalId);

    modifier checkCurrentStatus(WorkflowStatus _status) {
        require(currentStatus == _status, "Invalid workflow status");
        _;
    }

    modifier checkNonZeroAddress(address _address) {
        require(_address != address(0), "Address cannot be the zero address");
        _;
    }

    function authorize(
        address _address
    )
        external
        onlyOwner
        checkCurrentStatus(WorkflowStatus.RegisteringVoters)
        checkNonZeroAddress(_address)
    {
        require(!whitelist[_address].isRegistered, "already in the whitelist");
        whitelist[_address].isRegistered = true;
        emit VoterRegistered(_address);
    }

    function updateStatus(WorkflowStatus _newStatus) private {
        emit WorkflowStatusChange(currentStatus, _newStatus);
        currentStatus = _newStatus;
    }

    function startProposalsRegistration()
        external
        onlyOwner
        checkCurrentStatus(WorkflowStatus.RegisteringVoters)
    {
        updateStatus(WorkflowStatus.ProposalsRegistrationStarted);
    }

    modifier isRegisteredVoter(address _address) {
        require(whitelist[_address].isRegistered, "Voter is not registered");
        _;
    }

    function registerProposal(
        address _address,
        string memory _description
    )
        external
        checkNonZeroAddress(_address)
        isRegisteredVoter(_address)
        checkCurrentStatus(WorkflowStatus.ProposalsRegistrationStarted)
    {
        proposalList.push(Proposal({description: _description, voteCount: 0}));

        emit ProposalRegistered(proposalList.length);
    }

    function endProposalsRegistration()
        external
        onlyOwner
        checkCurrentStatus(WorkflowStatus.ProposalsRegistrationStarted)
    {
        updateStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }

    function startVotingSession()
        external
        onlyOwner
        checkCurrentStatus(WorkflowStatus.ProposalsRegistrationEnded)
    {
        updateStatus(WorkflowStatus.VotingSessionStarted);
    }

    function voteForProposal(
        address _address,
        uint256 _proposalId
    )
        external
        checkNonZeroAddress(_address)
        isRegisteredVoter(_address)
        checkCurrentStatus(WorkflowStatus.VotingSessionStarted)
    {
        require(!whitelist[_address].hasVoted, "Voter has already voted");
        require(_proposalId <= proposalList.length, "Invalid proposal id");

        whitelist[_address].hasVoted = true;
        whitelist[_address].votedProposalId = _proposalId;
        proposalList[_proposalId - 1].voteCount++;
        emit Voted(_address, _proposalId);
    }

    function endVotingSession()
        external
        onlyOwner
        checkCurrentStatus(WorkflowStatus.VotingSessionStarted)
    {
        updateStatus(WorkflowStatus.VotingSessionEnded);
    }

    function findWinningProposalId() private {
        uint256 maxVotes = 0;
        for (uint256 i = 0; i < proposalList.length; i++) {
            if (proposalList[i].voteCount > maxVotes) {
                maxVotes = proposalList[i].voteCount;
                winningProposalId = i + 1;
            }
        }
    }

    function countVotes()
        external
        onlyOwner
        checkCurrentStatus(WorkflowStatus.VotingSessionEnded)
    {
        findWinningProposalId();
        updateStatus(WorkflowStatus.VotesTallied);
    }

    function getWinner() external view returns (Proposal memory) {
        return proposalList[winningProposalId - 1];
    }
}
