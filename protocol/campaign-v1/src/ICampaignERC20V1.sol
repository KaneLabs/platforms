// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

interface ICampaignERC20V1 is IAccessControl {
    /**
     * STATE VARIABLE PUBLIC GETTERS
     */

    // @dev Constant for role as per https://docs.openzeppelin.com/contracts/5.x/access-control#using-access-control
    function ADMIN_ROLE() external view returns (bytes32);

    // @notice The campaign will automatically be set completed during a contribution that causes the total contributions to surpass the contributionThreshold.
    // @notice Once 'isCampaignCompleted == true', contributors can no longer withdraw via 'withdrawContribution', while admin 'transferContributions' is enabled.
    // @dev Once 'isCampaignCompleted == true' this state cannot be changed back to false, even if the total contributions stored on the contract falls below the contributionThreshold
    // @dev There is no manual direct method to toggle 'isCampaignCompleted'
    function isCampaignCompleted() external view returns (bool);

    // @dev Developer trade-off for developer readability over user gas cost
    // @dev adminCount == 0 only when the contract is uninitialized, so 'isCampaignInitialized == false' checks could be replaced by 'adminCount == 0'. We would then however, have the variable 'adminCount' used for two separate purposes throughout the contract.
    function isCampaignInitialized() external view returns (bool);

    // @notice Number of Admins
    // @dev There must be at least one admin at all times after initialization  
    function adminCount() external view returns (uint256);

    // @notice Contribution token address
    // @dev Cannot be changed after initialization
    function contributionToken() external view returns (address);

    // @dev Cannot be changed after initialization
    function contributionThreshold() external view returns (uint256);

    // @notice Contribution deadline
    // @dev Can be extended by an Admin
    function contributionDeadline() external view returns (uint256);

    // @notice Total amount of contributions transferred from the CampaignERC20V1 contract by an admin
    function contributionTransferred() external view returns (uint256);

    // @notice Total amount of contributions held by the campaign contract
    function totalContributions() external view returns (uint256);

    // @notice Contributor address => contributor balance
    function contributions(address contributorAddress_) external view returns (uint256);

    // @notice Contributor address => true if contributor address has been rejected from the campaign
    function isContributorRejected(address contributorAddress_) external view returns (bool);

    /**
     * INITIALIZE FUNCTION
     */

    /**
     * @param initialAdmin_ Address of initial admin
     * @param contributionToken_ Address of contribution ERC20 token
     * @param contributionThreshold_ Minimum amount of contribution token required to complete the campaign
     * @param contributionDeadline_ Unix timestamp for contribution deadline
     * @dev contributionToken_ and contributionThreshold_ are effectively immutable state variables - they can only be set once at initialization
     * @dev contributionDeadline_ can be later extended by an Admin
     * @dev To enable the contract factory pattern, we use an initialize function rather a constructor
     */
    function initialize(
        address initialAdmin_,
        address contributionToken_,
        uint256 contributionThreshold_,
        uint256 contributionDeadline_
    ) external;

    /**
     * EXTERNAL VIEW FUNCTION
     */

    // @notice Return true if contribution deadline is exceeded
    function isContributionDeadlineExceeded() external view returns (bool);

    /**
     * CONTRIBUTOR FUNCTIONS
     */

    /**
     * @notice Make a contribution to the campaign
     * @notice A contributor can call this function multiple times
     * @param submissionAmount_ Amount of contribution token submitted
     */
    function submitContribution(uint256 submissionAmount_) external;

    /**
     * @notice Withdraw from a previous contribution made to the campaign
     * @notice A contributor can call this function multiple times
     * @notice Note that withdrawals can still happen after the campaign deadline has been exceeded, but not after the campaign has been marked completed
     * @param withdrawalAmount_ Amount of contribution token to withdraw
     */
    function withdrawContribution(uint256 withdrawalAmount_) external;

    /**
     * ADMIN FUNCTIONS
     */

    /**
     *  @notice Extend contribution deadline
     *  @dev Can only be done if the current deadline has not been exceeded
     *  @param newDeadline_ Unix timestamp for new contribution deadline
     */
    function extendContributionDeadline(uint256 newDeadline_) external;

    /**
     *  @notice Reject contribution/s
     *  @notice The contributor/s will be refunded their entire contribution and will be banned from further participation (submit or withdraw contributions) in the campaign
     *  @param contributors_ Array of contributor addresses to reject
     *  @dev All contributor/s in the array must be eligible for rejection (i.e. they must have made a contribution and not have been rejected previously), otherwise the transaction will fail and all state changes reverted
     */
    function rejectContributions(address[] calldata contributors_) external;

    /**
     *  @notice Transfer campaign contributions to another address
     *  @notice Can only be done after the campaign is set as completed
     *  @param recipient_ Contribution recipient address
     *  @param amount_ Amount of contribution token to transfer from this contract
     */
    function transferContributions(address recipient_, uint256 amount_) external;

    /**
     *  @notice Grant Admin role to another address
     *  @param newAdmin_ Address of new admin
     *  @return true if Admin role was granted, false otherwise
     */
    function grantAdmin(address newAdmin_) external returns (bool);

    /**
     *  @notice Revoke Admin role from another address
     *  @dev There must be at least one admin at all times
     *  @param adminToRemove_ Address of admin to remove
     *  @return true if Admin role was revoked, false otherwise
     */
    function revokeAdmin(address adminToRemove_) external returns (bool);

    /**
     *  @notice Emergency function to recover tokens that were accidently sent to the contract
     *  @dev This function cannot cause the contract to have insufficient funds to fulfil withdrawal requests
     *  @param token_ Address of ERC20 token
     *  @param recipient_ Recipient address
     *  @param amount_ Amount of ERC20 token to transfer from contract
     *  @return true if operation was successful
     */
    function recoverToken(address token_, address recipient_, uint256 amount_) external returns (bool);
}