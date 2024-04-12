// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ICampaignETHV1 } from "./ICampaignETHV1.sol";

contract CampaignETHV1 is AccessControl, ReentrancyGuard, ICampaignETHV1 {
    /**
     * STATE VARIABLES
     */

    // @dev Constant for role as per https://docs.openzeppelin.com/contracts/5.x/access-control#using-access-control
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // @notice The campaign will automatically be set completed during a contribution that causes the total contributions to surpass the contributionThreshold.
    // @notice Once 'isCampaignCompleted == true', contributors can no longer withdraw via 'withdrawContribution', while admin 'transferContributions' is enabled.
    // @dev Once 'isCampaignCompleted == true' this state cannot be changed back to false, even if the total contributions stored on the contract falls below the contributionThreshold
    // @dev There is no manual direct method to toggle 'isCampaignCompleted'
    bool public isCampaignCompleted;

    // @dev Developer trade-off for developer readability over user gas cost
    // @dev adminCount == 0 only when the contract is uninitialized, so 'isCampaignInitialized == false' checks could be replaced by 'adminCount == 0'. We would then however, have the variable 'adminCount' used for two separate purposes throughout the contract.
    bool public isCampaignInitialized;

    // @notice Number of Admins
    // @dev There must be at least one admin at all times after initialization  
    uint256 public adminCount;

    // @dev Cannot be changed after initialization
    uint256 public contributionThreshold;

    // @notice Contribution deadline
    // @dev Can be extended by an Admin
    uint256 public contributionDeadline;

    // @notice Total amount of contributions transferred from the CampaignETHV1 contract by an admin
    uint256 public contributionTransferred;

    // @notice Total amount of contributions held by the campaign contract
    uint256 public totalContributions;

    // @notice Contributor address => contributor balance
    mapping (address => uint256) public contributions;

    // @notice Contributor address => true if contributor address has been rejected from the campaign
    mapping (address => bool) public isContributorRejected;

    /**
     * ERRORS
     */

    // @dev initialize error - initialize function has been called previously for this campaign contract
    error AlreadyInitialized();

    // @dev initialize error - initialAdmin_ cannot be zero address
    error InitialAdminZeroAddress();

    // @dev initialize error - contributionThreshold_ cannot be 0
    error ContributionThresholdZero();

    // @dev initialize error - contributionDeadline_ cannot be in the past
    error InitialContributionDeadlineBeforeCurrentTime();

    // @dev extendContributionDeadline error - contributionDeadline has already been exceeded
    error ContributionDeadlineExceeded();

    // @dev extendContributionDeadline error - newDeadline_ cannot be before the current deadline
    error DeadlineNotExtended();

    // @dev revokeAdmin error - cannot have zero admins
    error CannotHaveZeroAdmins();

    // @dev transferContributions error - Cannot transfer contributions if the campaign is incomplete
    error CampaignIncomplete();

    // @dev Cannot withdraw contributions if the campaign is completed
    error NoWithdrawAfterCampaignComplete();

    // @dev A rejected contributor cannot make submit or withdraw contributions (they will have been refunded their entire contribution)
    error ContributorRejected();

    // @dev withdrawContribution error
    error InsufficientBalanceForWithdrawal();
    error ContributorAlreadyRejected();

    // @dev rejectContribution error - Cannot reject address with current 0 contribution balance
    error NoContributionBalance();

    // @dev setCampaignCompleted error - Cannot set campaign as completed if the contribution threshold has not been met
    error ContributionThresholdNotMet();

    // @dev transferContribution error
    error InsufficientBalanceForTransfer();

    // @dev grantAdmin cannot be used with zero address input
    error CannotGrantAdminToZeroAddress();

    // @dev initialize function has not previously been called for this campaign contract
    error NotInitialized();

    // @dev recoverTokens error
    error InsufficientBalanceForRecovery();

    // @dev Thrown when an ETH transfer fails
    error ETHTransferFailed();

    /**
     * EVENTS
     */

    /**
     * @notice Emitted when a contribution is submitted
     * @param contributor Contributor address
     * @param actualSubmittedContribution Actual amount of contribution token transferred to this contract
     * @param newContributorBalance Updated contribution balance for contributor
     * @param newTotalContributions Updated total contribution balance for entire campaign
     */
    event ContributionSubmitted(address indexed contributor, uint256 actualSubmittedContribution, uint256 newContributorBalance, uint256 newTotalContributions);

    /**
     * @notice Emitted when a contribution is withdrawn
     * @param contributor Contributor address
     * @param actualWithdrawalAmount Actual amount of contribution token transferred from this contract
     * @param newContributorBalance Updated contribution balance for contributor
     * @param newTotalContributions Updated total contribution balance for entire campaign
     */
    event ContributionWithdrawn(address indexed contributor, uint256 actualWithdrawalAmount, uint256 newContributorBalance, uint256 newTotalContributions);
    
    // @notice Emitted when a contributor is rejected
    event ContributionRejected(address indexed contributor, uint256 refundAmount, uint256 newTotalContributions);

    /**
     * @notice Emitted when the contribution deadline is extended
     * @param admin Address of Admin who extended the contribution deadline
     * @param oldDeadline Previous contribution deadline
     * @param newDeadline Updated contribution deadline
     */
    event ContributionDeadlineExtended(address indexed admin, uint256 oldDeadline, uint256 newDeadline);

    // @notice Emitted when the campaign is set as completed
    event CampaignCompleted();

    /**
     * @notice Emitted when campaign contributions are transferred from this contract
     * @param recipient Address of transfer recipient
     * @param amount Amount of contribution token transferred
     */
    event ContributionsTransferred(address indexed recipient, uint256 amount);

    /**
     * @notice Emitted when tokens are recovered from the contract
     * @param token Address of token recovered
     * @param recipient Address of recovery recipient
     * @param amount Amount of token recovered
     */
    event RecoveryMade(address indexed token, address indexed recipient, uint256 amount);

    /**
     * INITIALIZE FUNCTION
     */

    /**
     * @param initialAdmin_ Address of initial admin
     * @param contributionThreshold_ Minimum amount of contribution token required to complete the campaign
     * @param contributionDeadline_ Unix timestamp for contribution deadline
     * @dev contributionThreshold_ is effectively an immutable state variable - they can only be set once at initialization
     * @dev contributionDeadline_ can be later extended by an Admin
     * @dev To enable the contract factory pattern, we use an initialize function rather a constructor
     */
    function initialize(
        address initialAdmin_,
        uint256 contributionThreshold_,
        uint256 contributionDeadline_
    ) external {
        if (isCampaignInitialized) revert AlreadyInitialized();
        if (initialAdmin_ == address(0)) revert InitialAdminZeroAddress();
        if (contributionThreshold_ == 0) revert ContributionThresholdZero();
        if (contributionDeadline_ <= block.timestamp) revert InitialContributionDeadlineBeforeCurrentTime(); 

        _grantRole(ADMIN_ROLE, initialAdmin_);
        adminCount += 1;
        contributionThreshold = contributionThreshold_;
        contributionDeadline = contributionDeadline_;
        isCampaignInitialized = true;
    }

    /**
     * EXTERNAL VIEW FUNCTION
     */

    // @notice Return true if contribution deadline is exceeded
    function isContributionDeadlineExceeded() external view returns (bool) {
        if (contributionDeadline == 0) return false;
        return _isContributionDeadlineExceeded();
    }

    /**
     * INTERNAL HELPER VIEW FUNCTIONS
     */

    // @notice Helper function to query whether contribution deadline is exceeded
    function _isContributionDeadlineExceeded() internal view returns (bool) {
        return contributionDeadline < block.timestamp;
    }

    // @notice Helper function to get total contributions
    function _getContributionTokenBalance() internal view returns (uint256) {
        return address(this).balance;
    }

    /**
     * CONTRIBUTOR FUNCTIONS
     */

    /**
     * @notice Make a contribution to the campaign
     * @notice A contributor can call this function multiple times
     * @dev msg.value is the amount of ETH contributed, equivalent to 'submissionAmount_' in the ERC20 version
     */
    function submitContribution() external payable {
        if (isCampaignInitialized == false) revert NotInitialized();
        if (_isContributionDeadlineExceeded()) revert ContributionDeadlineExceeded();
        address contributor_ = msg.sender;
        if (isContributorRejected[contributor_] == true) revert ContributorRejected();

        uint256 _actualSubmittedContribution = msg.value;
        // Cache state variables before state changes
        uint256 _oldContributorBalance = contributions[contributor_];
        uint256 _oldTotalContributions = totalContributions;

        // Contract state changes
        contributions[contributor_] = _oldContributorBalance + _actualSubmittedContribution;
        totalContributions = _oldTotalContributions + _actualSubmittedContribution;

        // Automatically mark campaign as completed if the contribution threshold has been met in this transaction
        bool _isCampaignCompleted = isCampaignCompleted;
        if (_isCampaignCompleted == false && _getContributionTokenBalance() >= contributionThreshold) {
            isCampaignCompleted = true;
            emit CampaignCompleted();
        }

        emit ContributionSubmitted(contributor_, _actualSubmittedContribution, _oldContributorBalance + _actualSubmittedContribution, _oldTotalContributions + _actualSubmittedContribution);
    }

    /**
     * @notice Withdraw from a previous contribution made to the campaign
     * @notice A contributor can call this function multiple times
     * @notice Note that withdrawals can still happen after the campaign deadline has been exceeded, but not after the campaign has been marked completed
     * @param withdrawalAmount_ Amount of contribution token to withdraw
     */
    function withdrawContribution(uint256 withdrawalAmount_) external {
        if (isCampaignInitialized == false) revert NotInitialized();
        if (isCampaignCompleted == true) revert NoWithdrawAfterCampaignComplete();
        address contributor_ = msg.sender;
        if (isContributorRejected[contributor_] == true) revert ContributorRejected();
        if (withdrawalAmount_ > contributions[contributor_]) revert InsufficientBalanceForWithdrawal();

        (uint256 _actualWithdrawalAmount, uint256 _newContributorBalance, uint256 _newTotalContributions) = _removeContribution(contributor_, withdrawalAmount_);
        
        emit ContributionWithdrawn(contributor_, _actualWithdrawalAmount, _newContributorBalance, _newTotalContributions);
    }

    /**
     * INTERNAL HELPER MUTATOR FUNCTIONS
     */

    /**
     * @dev Shared contribution removal logic for withdrawContribution and rejectContribution
     * @dev '.call' poses a reentrancy risk, because `contributor_` could be a smart contract with a malicious fallback function. Hence we use a reentrancy guard specifically for this function.
     * @param contributor_ Address of contributor
     * @param removalAmount_ Amount of contribution token to remove
     */
    function _removeContribution(address contributor_, uint256 removalAmount_) internal nonReentrant returns (
        uint256 actualRemovalAmount,
        uint256 newContributorBalance,
        uint256 newTotalContributions
    ) {
        // Do ERC20 transfer, and query actual amount of contribution token transferred (rather than trusting 'removalAmount_' input)
        uint256 _beforeContributionBalance = _getContributionTokenBalance();
        // External .call to contributor -> requires reentrancy guard
        (bool success, ) = contributor_.call{value: removalAmount_}("");
        if (success == false) revert ETHTransferFailed();
        uint256 _afterContributionBalance = _getContributionTokenBalance();
        uint256 _actualRemovalAmount = _beforeContributionBalance - _afterContributionBalance;

        // Cache state variables before state changes
        uint256 _oldContributorBalance = contributions[contributor_];
        uint256 _oldTotalContributions = totalContributions;

        // Contract state changes
        contributions[contributor_] = _oldContributorBalance - _actualRemovalAmount;
        totalContributions = _oldTotalContributions - _actualRemovalAmount;

        return (_actualRemovalAmount, _oldContributorBalance - _actualRemovalAmount, _oldTotalContributions - _actualRemovalAmount);
    }

    /**
     * ADMIN FUNCTIONS
     */

    /**
     *  @notice Extend contribution deadline
     *  @dev Can only be done if the current deadline has not been exceeded
     *  @dev We allow the deadline to be extended even if the campaign is completed. The rationale is to enable extension to a 'perpetual campaign'.
     *  @param newDeadline_ Unix timestamp for new contribution deadline
     */
    function extendContributionDeadline(uint256 newDeadline_) external onlyRole(ADMIN_ROLE) {
        uint256 _oldDeadline = contributionDeadline;
        if (_oldDeadline < block.timestamp) revert ContributionDeadlineExceeded();
        if (newDeadline_ <= _oldDeadline) revert DeadlineNotExtended();

        contributionDeadline = newDeadline_;
        emit ContributionDeadlineExtended(msg.sender, _oldDeadline, newDeadline_);
    }

    /**
     *  @notice Reject contribution/s
     *  @notice The contributor/s will be refunded their entire contribution and will be banned from further participation (submit or withdraw contributions) in the campaign
     *  @param contributors_ Array of contributor addresses to reject
     *  @dev All contributor/s in the array must be eligible for rejection (i.e. they must have made a contribution and not have been rejected previously), otherwise the transaction will fail and all state changes reverted
     */
    function rejectContributions(address[] calldata contributors_) external onlyRole(ADMIN_ROLE) {
        uint256 contributorCount = contributors_.length;
        for (uint256 i = 0; i < contributorCount; i++) {
            address contributor = contributors_[i];
            if (isContributorRejected[contributor] == true) revert ContributorAlreadyRejected();
            uint256 _currentContributorBalance = contributions[contributor];
            // Do not support pre-emptively blacklisting an address before they have made a contribution
            if (_currentContributorBalance == 0) revert NoContributionBalance();

            // Transfer the entire contribution back to the contributor
            uint256 _contributorBalance = contributions[contributor];
            (uint256 _removalAmount,,uint256 _newTotalContributions) = _removeContribution(contributor, _contributorBalance);
            isContributorRejected[contributor] = true;
            emit ContributionRejected(contributor, _removalAmount, _newTotalContributions);
        }
    }

    /**
     *  @notice Transfer campaign contributions to another address
     *  @notice Can only be done after the campaign is set as completed
     *  @param recipient_ Contribution recipient address
     *  @param amount_ Amount of contribution token to transfer from this contract
     */
    function transferContributions(address recipient_, uint256 amount_) external onlyRole(ADMIN_ROLE) nonReentrant {
        if (isCampaignCompleted == false) revert CampaignIncomplete();
        if (amount_ > totalContributions) revert InsufficientBalanceForTransfer();

        // .call to recipient_ -> requires reentrancy guard
        (bool success,) = recipient_.call{value: amount_}("");
        if(success == false) revert ETHTransferFailed();

        contributionTransferred += amount_;
        emit ContributionsTransferred(recipient_, amount_);
    }

    /**
     *  @notice Grant Admin role to another address
     *  @param newAdmin_ Address of new admin
     *  @return success true if Admin role was granted, false otherwise
     */
    function grantAdmin(address newAdmin_) external onlyRole(ADMIN_ROLE) returns (bool) {
        if (newAdmin_ == address(0)) revert CannotGrantAdminToZeroAddress();
        bool success = _grantRole(ADMIN_ROLE, newAdmin_);
        if (success == true) adminCount += 1;
        return success;
    }

    /**
     *  @notice Revoke Admin role from another address
     *  @dev There must be at least one admin at all times
     *  @param adminToRemove_ Address of admin to remove
     *  @return success true if Admin role was revoked, false otherwise
     */
    function revokeAdmin(address adminToRemove_) external onlyRole(ADMIN_ROLE) returns (bool) {
        if (adminCount == 1) revert CannotHaveZeroAdmins();
        bool success = _revokeRole(ADMIN_ROLE, adminToRemove_);
        if (success == true) adminCount -= 1;
        return success;
    }

    /**
     *  @notice Emergency function to recover tokens that were accidently sent to the contract
     *  @dev Direct ETH transfer to this contract should fail, as this contract does not have a receive() or fallback() function - https://docs.soliditylang.org/en/latest/contracts.html#receive-ether-function
     *  @dev Because direct ETH transfer to this contract should fail, then no recovery function is required for ETH
     *  @dev Recovery is allowed for ERC20 tokens that have been sent to the contract
     *  @param token_ Address of ERC20 token
     *  @param recipient_ Recipient address
     *  @param amount_ Amount of ERC20 token to transfer from contract
     *  @return true if operation was successful
     */
    function recoverToken(address token_, address recipient_, uint256 amount_) external onlyRole(ADMIN_ROLE) returns (bool) {
        bool success;
        success = IERC20(token_).transfer(recipient_, amount_);
        if (success) emit RecoveryMade(token_, recipient_, amount_);
        return success;
    }
}
