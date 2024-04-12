// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Vm } from "forge-std/Vm.sol";

import { TestBase } from "../TestBase.sol";
import { CampaignETHV1 } from "../../src/CampaignETHV1.sol";
import { CampaignFactoryV1 } from "../../src/CampaignFactoryV1.sol";
import { ICampaignETHV1 } from "../../src/ICampaignETHV1.sol";
import { ICampaignFactoryV1 } from "../../src/ICampaignFactoryV1.sol";

// Unit tests for 'rejectContributions' function
contract CampaignETHV1RejectContributionsTest is TestBase {
    ICampaignFactoryV1 public campaignFactory;
    ICampaignETHV1 public campaign;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
        vm.deal(CONTRIBUTOR, PREMINT_AMOUNT);
        campaign = ICampaignETHV1(campaignFactory.createCampaignETH(ADMIN, CAMPAIGN_THRESHOLD, CAMPAIGN_DEADLINE));
    }

    function test_rejectContributions_Revert_NonAdmin() public {
        // Arrange
        address[] memory rejectees = new address[](1);
        rejectees[0] = CONTRIBUTOR;

        // Assert
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, CONTRIBUTOR, campaign.ADMIN_ROLE())
        );

        // Act
        vm.prank(CONTRIBUTOR);
        campaign.rejectContributions(rejectees);
    }

    function test_rejectContributions_Revert_ContributorAlreadyRejected() public {
        // Arrange - Create input argument for 'rejectContributions' function
        address[] memory rejectees = new address[](1);
        rejectees[0] = CONTRIBUTOR;

        // Arrange - Make contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD}();

        // Arrange - Reject contribution
        vm.prank(ADMIN);
        campaign.rejectContributions(rejectees);
        assertEq(campaign.isContributorRejected(CONTRIBUTOR), true);

        // Assert
        assertEq(address(campaign).balance, 0);
        assertEq(campaign.totalContributions(), 0);
        vm.expectRevert(CampaignETHV1.ContributorAlreadyRejected.selector);

        // Act
        vm.prank(ADMIN);
        campaign.rejectContributions(rejectees);
    }

    function test_rejectContributions_Revert_NoContributionBalance() public {
        // Arrange - Create input argument for 'rejectContributions' function
        address[] memory rejectees = new address[](1);
        rejectees[0] = CONTRIBUTOR;
        assertEq(campaign.contributions(CONTRIBUTOR), 0);

        // Assert
        vm.expectRevert(CampaignETHV1.NoContributionBalance.selector);

        // Act
        vm.prank(ADMIN);
        campaign.rejectContributions(rejectees);
    }

    function test_rejectContributions_Success() public {
        // Arrange - Make contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD}();

        // Arrange - Create input argument for 'rejectContributions' function
        address[] memory rejectees = new address[](1);
        rejectees[0] = CONTRIBUTOR;

        // Assert - Check event/s
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionRejected(CONTRIBUTOR, CAMPAIGN_THRESHOLD, 0);

        // Act - Reject contribution
        vm.prank(ADMIN);
        campaign.rejectContributions(rejectees);

        // Assert - check state
        assertEq(campaign.totalContributions(), 0);
        assertEq(campaign.contributions(CONTRIBUTOR), 0); 
        assertEq(campaign.isContributorRejected(CONTRIBUTOR), true);
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }

    function test_rejectContributions_Revert_MultipleRejectionsWithAnyInvalidRejectionCandidate() public {
        // Arrange - Make contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD}();

        // Arrange - Create input argument for 'rejectContributions' function
        address[] memory rejectees = new address[](2);
        rejectees[0] = CONTRIBUTOR;
        rejectees[1] = ADMIN;

        // Assert - Check event/s
        vm.expectRevert(CampaignETHV1.NoContributionBalance.selector);

        // Act - Reject contribution
        vm.prank(ADMIN);
        campaign.rejectContributions(rejectees);

        // Assert - check state
        assertEq(campaign.totalContributions(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributions(CONTRIBUTOR), CAMPAIGN_THRESHOLD); 
        assertEq(campaign.isContributorRejected(CONTRIBUTOR), false);
        assertEq(campaign.isContributorRejected(ADMIN), false);
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }
}
