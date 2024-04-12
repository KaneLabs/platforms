// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Vm } from "forge-std/Vm.sol";

import { TestBase } from "../TestBase.sol";
import { CampaignETHV1 } from "../../src/CampaignETHV1.sol";
import { CampaignFactoryV1 } from "../../src/CampaignFactoryV1.sol";
import { ICampaignETHV1 } from "../../src/ICampaignETHV1.sol";
import { ICampaignFactoryV1 } from "../../src/ICampaignFactoryV1.sol";

// Unit tests for 'extendContributionDeadline' function
contract CampaignETHV1ExtendContributionDeadlineTest is TestBase {
    ICampaignFactoryV1 public campaignFactory;
    ICampaignETHV1 public campaign;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
        campaign = ICampaignETHV1(campaignFactory.createCampaignETH(ADMIN, CAMPAIGN_THRESHOLD, CAMPAIGN_DEADLINE));
    }

    function test_extendContributionDeadline_Revert_NonAdmin() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, CONTRIBUTOR, campaign.ADMIN_ROLE())
        );
        vm.prank(CONTRIBUTOR);
        campaign.extendContributionDeadline(CAMPAIGN_DEADLINE + 1);
    }

    function test_extendContributionDeadline_Revert_ContributionDeadlineExceeded() public {
        // Arrange - Move time to past deadline
        vm.warp(CAMPAIGN_DEADLINE + 1);

        // Assert
        vm.expectRevert(CampaignETHV1.ContributionDeadlineExceeded.selector);

        // Act
        vm.prank(ADMIN);
        campaign.extendContributionDeadline(CAMPAIGN_DEADLINE * 2);
    }

    function test_extendContributionDeadline_Revert_DeadlineNotExtended() public {
        // Assert
        vm.expectRevert(CampaignETHV1.DeadlineNotExtended.selector);

        // Act
        vm.prank(ADMIN);
        campaign.extendContributionDeadline(CAMPAIGN_DEADLINE / 2);
    }

    function test_extendContributionDeadline_Success() public {
        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionDeadlineExtended(ADMIN, CAMPAIGN_DEADLINE, CAMPAIGN_DEADLINE * 2);

        // Act
        vm.prank(ADMIN);
        campaign.extendContributionDeadline(CAMPAIGN_DEADLINE * 2);
    }
}
