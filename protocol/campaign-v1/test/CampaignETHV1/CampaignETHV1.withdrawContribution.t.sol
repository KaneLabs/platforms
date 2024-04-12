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

// Unit tests for 'withdrawContribution' function
contract CampaignETHV1SubmitContributionTest is TestBase {
    ICampaignETHV1 public campaign;
    ICampaignFactoryV1 public campaignFactory;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
        vm.deal(CONTRIBUTOR, PREMINT_AMOUNT);
        vm.deal(CONTRIBUTOR_2, PREMINT_AMOUNT);
        campaign = ICampaignETHV1(campaignFactory.createCampaignETH(ADMIN, CAMPAIGN_THRESHOLD, CAMPAIGN_DEADLINE));
    }

    function test_withdrawContribution_Revert_CompletedCampaign() public {
        // Arrange - Complete Campaign
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD + 1}();
        assertEq(campaign.isCampaignCompleted(), true);

        // Act + Assert
        vm.expectRevert(CampaignETHV1.NoWithdrawAfterCampaignComplete.selector);
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD + 1);
    }

    function test_withdrawContribution_Revert_RejectedContributor() public {
        // Arrange - submit contribution -> admin reject contributor
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD / 2}();

        address[] memory rejectees = new address[](1);
        rejectees[0] = CONTRIBUTOR;
        vm.prank(ADMIN);
        campaign.rejectContributions(rejectees);

        // Act
        vm.expectRevert(CampaignETHV1.ContributorRejected.selector);
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD + 1);

        // Assert
        assertEq(campaign.isContributorRejected(CONTRIBUTOR), true);
    }

    function test_withdrawContribution_Revert_InsufficientBalance() public {
        // Arrange - submit contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD / 4}();

        // Act + Assert
        vm.expectRevert(CampaignETHV1.InsufficientBalanceForWithdrawal.selector);
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD / 2);
    }

    function test_withdrawContribution_Revert_InsufficientBalance_EdgeCaseOfDirectETHTransfer() public {
        // Arrange - submit contribution, then directly transfer tokens
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD / 4}();
        vm.expectRevert();
        vm.prank(CONTRIBUTOR);
        address(campaign).call{value: CAMPAIGN_THRESHOLD / 2}("");

        // Act + Assert
        vm.expectRevert(CampaignETHV1.InsufficientBalanceForWithdrawal.selector);
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD / 2);
    }

    function test_withdrawContribution_Success() public {
        // Arrange - submit contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD / 4}();

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionWithdrawn(CONTRIBUTOR, CAMPAIGN_THRESHOLD / 4, 0, 0);

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
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }

    function test_withdrawContribution_Success_AfterDeadlineExceeded() public {
        // Arrange - submit contribution -> move time past deadline
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD / 4}();
        vm.warp(CAMPAIGN_DEADLINE + 1);

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionWithdrawn(CONTRIBUTOR, CAMPAIGN_THRESHOLD / 4, 0, 0);

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
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }

    function test_withdrawContribution_Success_MultipleContributors() public {
        // Arrange - submit contributions from multiple contributors
        vm.prank(CONTRIBUTOR);
        CONTRIBUTOR_2.call{value: CAMPAIGN_THRESHOLD / 4}("");
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD / 4}();
        vm.prank(CONTRIBUTOR_2);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD / 4}();

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionWithdrawn(CONTRIBUTOR, CAMPAIGN_THRESHOLD / 8, CAMPAIGN_THRESHOLD / 8, 3 * CAMPAIGN_THRESHOLD / 8);

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
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }

    function test_withdrawContribution_Success_MultipleWithdrawals() public {
        // Arrange - make first withdrawal
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD / 2}();
        vm.prank(CONTRIBUTOR);
        campaign.withdrawContribution(CAMPAIGN_THRESHOLD / 4);

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionWithdrawn(CONTRIBUTOR, CAMPAIGN_THRESHOLD / 4, 0, 0);

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
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }
}
