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

// Unit tests for 'transferContributions' function
contract CampaignETHV1TransferContributionsTest is TestBase {
    ICampaignFactoryV1 public campaignFactory;
    ICampaignETHV1 public campaign;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
        vm.deal(CONTRIBUTOR, PREMINT_AMOUNT);
        campaign = ICampaignETHV1(campaignFactory.createCampaignETH(ADMIN, CAMPAIGN_THRESHOLD, CAMPAIGN_DEADLINE));
    }

    function test_transferContributions_Revert_NonAdmin() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, CONTRIBUTOR, campaign.ADMIN_ROLE())
        );
        vm.prank(CONTRIBUTOR);
        campaign.transferContributions(CONTRIBUTOR, CAMPAIGN_THRESHOLD);
    }

    function test_transferContributions_Revert_CampaignIncomplete() public {
        vm.expectRevert(CampaignETHV1.CampaignIncomplete.selector);
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD);
    }

    function test_transferContributions_Revert_InsufficientBalanceForTransfer() public {
        // Arrange - Complete campaign
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD}();
        assertEq(campaign.isCampaignCompleted(), true);

        // Assert
        vm.expectRevert(CampaignETHV1.InsufficientBalanceForTransfer.selector);
        
        // Act
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD * 2);
    }

    function test_transferContributions_Success() public {
        // Arrange - Complete campaign
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD}();
        assertEq(campaign.isCampaignCompleted(), true);

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionsTransferred(ADMIN, CAMPAIGN_THRESHOLD);

        // Act
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD);

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), true);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.adminCount(), 1);
        assertEq(campaign.contributionThreshold(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributionDeadline(), CAMPAIGN_DEADLINE);
        assertEq(campaign.contributionTransferred(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.totalContributions(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributions(CONTRIBUTOR), CAMPAIGN_THRESHOLD); 
        assertEq(campaign.isContributionDeadlineExceeded(), false);
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }

    function test_transferContributions_Success_MultiTransfers() public {
        // Arrange - Complete campaign
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD}();
        assertEq(campaign.isCampaignCompleted(), true);

        /** First transfer **/

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionsTransferred(ADMIN, CAMPAIGN_THRESHOLD / 2);

        // Act - Transfer half of the contributions
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD / 2);

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), true);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.adminCount(), 1);
        assertEq(campaign.contributionThreshold(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributionDeadline(), CAMPAIGN_DEADLINE);
        assertEq(campaign.contributionTransferred(), CAMPAIGN_THRESHOLD / 2);
        assertEq(campaign.totalContributions(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributions(CONTRIBUTOR), CAMPAIGN_THRESHOLD); 
        assertEq(campaign.isContributionDeadlineExceeded(), false);
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());

        /** Second transfer **/

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.ContributionsTransferred(ADMIN_2, CAMPAIGN_THRESHOLD / 2);

        // Act - Transfer other half of the contributions
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN_2, CAMPAIGN_THRESHOLD / 2);

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), true);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.adminCount(), 1);
        assertEq(campaign.contributionThreshold(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributionDeadline(), CAMPAIGN_DEADLINE);
        assertEq(campaign.contributionTransferred(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.totalContributions(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributions(CONTRIBUTOR), CAMPAIGN_THRESHOLD); 
        assertEq(campaign.isContributionDeadlineExceeded(), false);
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }

    function test_transferContributions_Revert_DirectETHTransferMadeInsteadOfSubmitContribution() public {
        // Arrange - Complete campaign
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD}();
        assertEq(campaign.isCampaignCompleted(), true);

        // Arrange - Make direct ETH transfer
        // Should revert because we have no fallback() or receive() function implemented
        vm.expectRevert();
        vm.prank(CONTRIBUTOR);
        address(campaign).call{value: CAMPAIGN_THRESHOLD}("");

        // Assert
        assertEq(address(campaign).balance, CAMPAIGN_THRESHOLD);
        assertEq(campaign.totalContributions(), CAMPAIGN_THRESHOLD);
        vm.expectRevert(CampaignETHV1.InsufficientBalanceForTransfer.selector);

        // Act - Attempt transfer of entire contribution token balance of contract
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD * 2);
    }
}
