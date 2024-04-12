// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { Vm } from "forge-std/Vm.sol";

import { TestBase } from "../TestBase.sol";
import { CampaignERC20V1 } from "../../src/CampaignERC20V1.sol";
import { CampaignFactoryV1 } from "../../src/CampaignFactoryV1.sol";
import { ICampaignERC20V1 } from "../../src/ICampaignERC20V1.sol";
import { ICampaignFactoryV1 } from "../../src/ICampaignFactoryV1.sol";
import { MockERC20 } from "../utils/MockERC20.sol";

// Unit tests for 'withdrawContribution' function
contract CampaignERC20V1SubmitContributionTest is TestBase {
    ICampaignERC20V1 public campaign;
    ICampaignFactoryV1 public campaignFactory;
    IERC20 public token;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
        token = new MockERC20("MockToken", "MockToken", PREMINT_AMOUNT);
        token.transfer(CONTRIBUTOR, PREMINT_AMOUNT);
        campaign = ICampaignERC20V1(campaignFactory.createCampaignERC20(ADMIN, address(token), CAMPAIGN_THRESHOLD, CAMPAIGN_DEADLINE));
        vm.prank(CONTRIBUTOR);
        token.approve(address(campaign), PREMINT_AMOUNT);
        vm.prank(CONTRIBUTOR_2);
        token.approve(address(campaign), PREMINT_AMOUNT);
    }

    function test_withdrawContribution_Revert_CompletedCampaign() public {
        // Arrange - Complete Campaign
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD + 1);
        assertEq(campaign.isCampaignCompleted(), true);

        // Act + Assert
        vm.expectRevert(CampaignERC20V1.NoWithdrawAfterCampaignComplete.selector);
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD + 1);
    }

    function test_withdrawContribution_Revert_RejectedContributor() public {
        // Arrange - submit contribution -> admin reject contributor
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD / 2);

        address[] memory rejectees = new address[](1);
        rejectees[0] = CONTRIBUTOR;
        vm.prank(ADMIN);
        campaign.rejectContributions(rejectees);

        // Act
        vm.expectRevert(CampaignERC20V1.ContributorRejected.selector);
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD + 1);

        // Assert
        assertEq(campaign.isContributorRejected(CONTRIBUTOR), true);
    }

    function test_withdrawContribution_Revert_InsufficientBalance() public {
        // Arrange - submit contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD / 4);

        // Act + Assert
        vm.expectRevert(CampaignERC20V1.InsufficientBalanceForWithdrawal.selector);
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD / 2);
    }

    function test_withdrawContribution_Revert_InsufficientBalance_EdgeCaseOfDirectERC20Transfer() public {
        // Arrange - submit contribution, then directly transfer tokens
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD / 4);
        vm.prank(CONTRIBUTOR);
        token.transfer(address(campaign), CAMPAIGN_THRESHOLD / 2);

        // Act + Assert
        vm.expectRevert(CampaignERC20V1.InsufficientBalanceForWithdrawal.selector);
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD / 2);
    }

    function test_withdrawContribution_Success() public {
        // Arrange - submit contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD / 4);

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignERC20V1.ContributionWithdrawn(CONTRIBUTOR, CAMPAIGN_THRESHOLD / 4, 0, 0);

        // Act
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD / 4);

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), false);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), 0);
        assertEq(campaign.contributions(CONTRIBUTOR), 0); 
        assertEq(campaign.isContributionDeadlineExceeded(), false);
    }

    function test_withdrawContribution_Success_AfterDeadlineExceeded() public {
        // Arrange - submit contribution -> move time past deadline
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD / 4);
        vm.warp(CAMPAIGN_DEADLINE + 1);

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignERC20V1.ContributionWithdrawn(CONTRIBUTOR, CAMPAIGN_THRESHOLD / 4, 0, 0);

        // Act
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD / 4);

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), false);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), 0);
        assertEq(campaign.contributions(CONTRIBUTOR), 0); 
        assertEq(campaign.isContributionDeadlineExceeded(), true);
    }

    function test_withdrawContribution_Success_MultipleContributors() public {
        // Arrange - submit contributions from multiple contributors
        vm.prank(CONTRIBUTOR);
        token.transfer(CONTRIBUTOR_2, CAMPAIGN_THRESHOLD / 4);
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD / 4);
        vm.prank(CONTRIBUTOR_2);
        campaign.submitContribution(CAMPAIGN_THRESHOLD / 4);

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignERC20V1.ContributionWithdrawn(CONTRIBUTOR, CAMPAIGN_THRESHOLD / 8, CAMPAIGN_THRESHOLD / 8, 3 * CAMPAIGN_THRESHOLD / 8);

        // Act
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD / 8);

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), false);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), 3 * CAMPAIGN_THRESHOLD / 8);
        assertEq(campaign.contributions(CONTRIBUTOR), CAMPAIGN_THRESHOLD / 8);
        assertEq(campaign.contributions(CONTRIBUTOR_2), CAMPAIGN_THRESHOLD / 4); 
        assertEq(campaign.isContributionDeadlineExceeded(), false);
    }

    function test_withdrawContribution_Success_MultipleWithdrawals() public {
        // Arrange - make first withdrawal
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD / 2);
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD / 4);

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignERC20V1.ContributionWithdrawn(CONTRIBUTOR, CAMPAIGN_THRESHOLD / 4, 0, 0);

        // Act - Make second withdrawal
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD / 4);

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), false);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), 0);
        assertEq(campaign.contributions(CONTRIBUTOR), 0);
        assertEq(campaign.isContributionDeadlineExceeded(), false);
    }
}
