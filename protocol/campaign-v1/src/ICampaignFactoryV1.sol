// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

interface ICampaignFactoryV1 {
    // @dev Address where logic/code of CampaignERCV1.sol lives 
    function campaignERC20V1Implementation() external view returns (address);

    // @dev Address where logic/code of CampaignETHV1.sol lives 
    function campaignETHV1Implementation() external view returns (address);
    
    /**
     * @notice Create ERC20 Campaign
     * @dev Input validation is performed in CampaignERC20V1.initialize()
     * @param initialAdmin_ Address of initial admin
     * @param contributionToken_ Address of contribution ERC20 token
     * @param contributionThreshold_ Minimum amount of contribution token required to complete the campaign
     * @param contributionDeadline_ Unix timestamp for contribution deadline
     * @return Address of newly created campaign
     */
    function createCampaignERC20(
        address initialAdmin_,
        address contributionToken_,
        uint256 contributionThreshold_,
        uint256 contributionDeadline_
    ) external returns (address);

    /**
     * @notice Create ETH (or native gas token) Campaign
     * @dev Input validation is performed in CampaignETHV1.initialize()
     * @param initialAdmin_ Address of initial admin
     * @param contributionThreshold_ Minimum amount of contribution token required to complete the campaign
     * @param contributionDeadline_ Unix timestamp for contribution deadline
     * @return Address of newly created campaign
     */
    function createCampaignETH(
        address initialAdmin_,
        uint256 contributionThreshold_,
        uint256 contributionDeadline_
    ) external returns (address);
}