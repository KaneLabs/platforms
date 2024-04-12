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

// Unit tests for 'transferContributions' function
contract CampaignERC20V1TransferContributionsTest is TestBase {
    ICampaignFactoryV1 public campaignFactory;
    ICampaignERC20V1 public campaign;
    IERC20 public token;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
        token = new MockERC20("MockToken", "MockToken", PREMINT_AMOUNT);
        token.transfer(CONTRIBUTOR, PREMINT_AMOUNT);
        campaign = ICampaignERC20V1(campaignFactory.createCampaignERC20(ADMIN, address(token), CAMPAIGN_THRESHOLD, CAMPAIGN_DEADLINE));
        vm.prank(CONTRIBUTOR);
        token.approve(address(campaign), PREMINT_AMOUNT);
    }

    function test_transferContributions_Revert_NonAdmin() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, CONTRIBUTOR, campaign.ADMIN_ROLE())
        );
        vm.prank(CONTRIBUTOR);
        campaign.transferContributions(CONTRIBUTOR, CAMPAIGN_THRESHOLD);
    }

    function test_transferContributions_Revert_CampaignIncomplete() public {
        vm.expectRevert(CampaignERC20V1.CampaignIncomplete.selector);
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD);
    }

    function test_transferContributions_Revert_InsufficientBalanceForTransfer() public {
        // Arrange - Complete campaign
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD);
        assertEq(campaign.isCampaignCompleted(), true);

        // Assert
        vm.expectRevert(CampaignERC20V1.InsufficientBalanceForTransfer.selector);
        
        // Act
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD * 2);
    }

    function test_transferContributions_Success() public {
        // Arrange - Complete campaign
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD);
        assertEq(campaign.isCampaignCompleted(), true);

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignERC20V1.ContributionsTransferred(ADMIN, CAMPAIGN_THRESHOLD);

        // Act
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD);

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), true);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.adminCount(), 1);
        assertEq(campaign.contributionToken(), address(token));
        assertEq(campaign.contributionThreshold(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributionDeadline(), CAMPAIGN_DEADLINE);
        assertEq(campaign.contributionTransferred(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.totalContributions(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributions(CONTRIBUTOR), CAMPAIGN_THRESHOLD); 
        assertEq(campaign.isContributionDeadlineExceeded(), false);
    }

    function test_transferContributions_Success_MultiTransfers() public {
        // Arrange - Complete campaign
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD);
        assertEq(campaign.isCampaignCompleted(), true);

        /** First transfer **/

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignERC20V1.ContributionsTransferred(ADMIN, CAMPAIGN_THRESHOLD / 2);

        // Act - Transfer half of the contributions
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD / 2);

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), true);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.adminCount(), 1);
        assertEq(campaign.contributionToken(), address(token));
        assertEq(campaign.contributionThreshold(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributionDeadline(), CAMPAIGN_DEADLINE);
        assertEq(campaign.contributionTransferred(), CAMPAIGN_THRESHOLD / 2);
        assertEq(campaign.totalContributions(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributions(CONTRIBUTOR), CAMPAIGN_THRESHOLD); 
        assertEq(campaign.isContributionDeadlineExceeded(), false);

        /** Second transfer **/

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignERC20V1.ContributionsTransferred(ADMIN_2, CAMPAIGN_THRESHOLD / 2);

        // Act - Transfer other half of the contributions
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN_2, CAMPAIGN_THRESHOLD / 2);

        // Assert - Check state
        assertEq(campaign.isCampaignCompleted(), true);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.adminCount(), 1);
        assertEq(campaign.contributionToken(), address(token));
        assertEq(campaign.contributionThreshold(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributionDeadline(), CAMPAIGN_DEADLINE);
        assertEq(campaign.contributionTransferred(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.totalContributions(), CAMPAIGN_THRESHOLD);
        assertEq(campaign.contributions(CONTRIBUTOR), CAMPAIGN_THRESHOLD); 
        assertEq(campaign.isContributionDeadlineExceeded(), false);
    }

    function test_transferContributions_Revert_DirectERC20TransferMadeInsteadOfSubmitContribution() public {
        // Arrange - Complete campaign
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD);
        assertEq(campaign.isCampaignCompleted(), true);

        // Arrange - Make direct ERC20 transfer
        vm.prank(CONTRIBUTOR);
        token.transfer(address(campaign), CAMPAIGN_THRESHOLD);
        assertEq(token.balanceOf(address(campaign)), CAMPAIGN_THRESHOLD * 2);
        assertEq(campaign.totalContributions(), CAMPAIGN_THRESHOLD);

        // Assert
        vm.expectRevert(CampaignERC20V1.InsufficientBalanceForTransfer.selector);

        // Act - Attempt transfer of entire contribution token balance of contract
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD * 2);
    }
}
