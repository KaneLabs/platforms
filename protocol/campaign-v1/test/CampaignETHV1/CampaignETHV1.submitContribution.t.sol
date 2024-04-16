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

// Unit tests for 'submitContribution' function
contract CampaignETHV1SubmitContributionTest is TestBase {
    ICampaignETHV1 public campaign;
    ICampaignFactoryV1 public campaignFactory;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
        vm.deal(CONTRIBUTOR, PREMINT_AMOUNT);
        vm.deal(CONTRIBUTOR_2, PREMINT_AMOUNT);
        campaign = ICampaignETHV1(campaignFactory.createCampaignETH(ADMIN, CAMPAIGN_THRESHOLD, CAMPAIGN_DEADLINE));
    }

    function test_submitContribution_Revert_DeadlineExceeded() public {
        // Arrange - Move time past deadline
        vm.warp(CAMPAIGN_DEADLINE + 1);

        // Act + assert
        assertEq(campaign.isContributionDeadlineExceeded(), true);
        vm.expectRevert(CampaignETHV1.ContributionDeadlineExceeded.selector);
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD / 2}();
    }

    // Make single contribution that is half of the threshold
    function test_submitContribution_Success() public {
        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionSubmitted(CONTRIBUTOR, CAMPAIGN_THRESHOLD / 2, CAMPAIGN_THRESHOLD / 2, CAMPAIGN_THRESHOLD / 2);

        // Act
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD / 2}();

        // Assert state
        assertEq(campaign.isCampaignCompleted(), false);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.adminCount(), 1);
        assertEq(campaign.contributionThreshold(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributionDeadline(), CAMPAIGN_DEADLINE);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), CAMPAIGN_THRESHOLD / 2);
        assertEq(campaign.contributions(CONTRIBUTOR), CAMPAIGN_THRESHOLD / 2); 
        assertEq(campaign.isContributionDeadlineExceeded(), false);
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }

    // Continuing from last test, add another contribution equivalent to the threshold
    function test_submitContribution_PassThresholdCausesCampaignCompletion() public {
        test_submitContribution_Success();

        // Check events
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionSubmitted(CONTRIBUTOR, CAMPAIGN_THRESHOLD, 3 * CAMPAIGN_THRESHOLD / 2, 3 * CAMPAIGN_THRESHOLD / 2);
        emit CampaignETHV1.CampaignCompleted();

        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD}();

        // Check state
        assertEq(campaign.isCampaignCompleted(), true);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), 3 * CAMPAIGN_THRESHOLD / 2);
        assertEq(campaign.contributions(CONTRIBUTOR), 3 * CAMPAIGN_THRESHOLD / 2); 
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }

    // Continuing from last test where campaign was completed, test that another contributor can make a contribution
    function test_submitContribution_CanContinueContributionAfterCampaignCompletion() public {
        test_submitContribution_PassThresholdCausesCampaignCompletion();
        
        // Arrange - Pass contribution token to contributor 2
        uint256 contributionTokenRemaining = CONTRIBUTOR.balance;
        vm.prank(CONTRIBUTOR);
        CONTRIBUTOR_2.call{value: contributionTokenRemaining}("");

        // Assert - Check events
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionSubmitted(CONTRIBUTOR_2, contributionTokenRemaining, contributionTokenRemaining, PREMINT_AMOUNT);

        // Act
        vm.prank(CONTRIBUTOR_2);
        campaign.submitContribution{value: contributionTokenRemaining}();

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), true);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), PREMINT_AMOUNT);
        assertEq(campaign.contributions(CONTRIBUTOR), 3 * CAMPAIGN_THRESHOLD / 2); 
        assertEq(campaign.contributions(CONTRIBUTOR_2), contributionTokenRemaining); 
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }

    // Continuing from last test
    function test_submitContribution_Revert_ContributorRejected() public {
        test_submitContribution_CanContinueContributionAfterCampaignCompletion();

        // Arrange - Reject CONTRIBUTOR_2
        address[] memory rejectees = new address[](1);
        rejectees[0] = CONTRIBUTOR_2;
        vm.prank(ADMIN);
        campaign.rejectContributions(rejectees);

        // Act
        uint256 contributionTokenRemaining = CONTRIBUTOR_2.balance;
        vm.expectRevert(CampaignETHV1.ContributorRejected.selector);
        vm.prank(CONTRIBUTOR_2);
        campaign.submitContribution{value: contributionTokenRemaining}();

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), true);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), 3 * CAMPAIGN_THRESHOLD / 2);
        assertEq(campaign.contributions(CONTRIBUTOR), 3 * CAMPAIGN_THRESHOLD / 2); 
        assertEq(campaign.contributions(CONTRIBUTOR_2), 0); 
        assertEq(campaign.isContributorRejected(CONTRIBUTOR), false); 
        assertEq(campaign.isContributorRejected(CONTRIBUTOR_2), true); 
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }
}
