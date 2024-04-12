// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { CampaignERC20V1 } from './CampaignERC20V1.sol';
import { CampaignETHV1 } from './CampaignETHV1.sol';
import { ICampaignERC20V1 } from './ICampaignERC20V1.sol';
import { ICampaignETHV1 } from './ICampaignETHV1.sol';
import { ICampaignFactoryV1 } from './ICampaignFactoryV1.sol';

// OpenZeppelin implementation for deploying minimal proxy contracts via EIP1167 Standard - https://docs.openzeppelin.com/contracts/4.x/api/proxy#Clones
import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';

contract CampaignFactoryV1 is ICampaignFactoryV1 {
    // @dev Address where logic/code of CampaignERC29V1.sol lives 
    address public campaignERC20V1Implementation;

    // @dev Address where logic/code of CampaignETHV1.sol lives 
    address public campaignETHV1Implementation;

    /**
     * @notice Emitted when an ERC20 campaign is created
     * @param campaignAddress Address of newly created campaign
     * @param initialAdmin Address of initial admin
     * @param contributionToken Address of contribution ERC20 token
     * @param contributionThreshold Minimum amount of contribution token required to complete the campaign
     * @param contributionDeadline Unix timestamp for contribution deadline
     */
    event CampaignERC20Created(address indexed campaignAddress, address indexed initialAdmin, address indexed contributionToken, uint256 contributionThreshold, uint256 contributionDeadline);

    /**
     * @notice Emitted when an ETH campaign is created
     * @param campaignAddress Address of newly created campaign
     * @param initialAdmin Address of initial admin
     * @param contributionThreshold Minimum amount of contribution token required to complete the campaign
     * @param contributionDeadline Unix timestamp for contribution deadline
     */
    event CampaignETHCreated(address indexed campaignAddress, address indexed initialAdmin, uint256 contributionThreshold, uint256 contributionDeadline);

    constructor() {
        ICampaignERC20V1 _campaignERC20V1Implementation = new CampaignERC20V1();
        ICampaignETHV1 _campaignETHV1Implementation = new CampaignETHV1();
        campaignERC20V1Implementation = address(_campaignERC20V1Implementation);
        campaignETHV1Implementation = address(_campaignETHV1Implementation);
    }
    
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
    ) external returns (address) {
        address campaignAddress = Clones.clone(campaignERC20V1Implementation);
        ICampaignERC20V1(campaignAddress).initialize(initialAdmin_, contributionToken_, contributionThreshold_, contributionDeadline_);
        emit CampaignERC20Created(campaignAddress, initialAdmin_, contributionToken_, contributionThreshold_, contributionDeadline_);
        return campaignAddress;
    }

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
    ) external returns (address) {
        address campaignAddress = Clones.clone(campaignETHV1Implementation);
        ICampaignETHV1(campaignAddress).initialize(initialAdmin_, contributionThreshold_, contributionDeadline_);
        emit CampaignETHCreated(campaignAddress, initialAdmin_, contributionThreshold_, contributionDeadline_);
        return campaignAddress;
    }
}