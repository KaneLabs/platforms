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

// Unit tests for 'recoverToken' function
contract CampaignERC20V1RecoverTokenTest is TestBase {
    ICampaignFactoryV1 public campaignFactory;
    ICampaignERC20V1 public campaign;
    IERC20 public token;
    IERC20 public token2;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
        token = new MockERC20("MockToken", "MockToken", PREMINT_AMOUNT);
        token2 = new MockERC20("MockToken2", "MockToken2", PREMINT_AMOUNT);
        token.transfer(CONTRIBUTOR, PREMINT_AMOUNT);
        campaign = ICampaignERC20V1(campaignFactory.createCampaignERC20(ADMIN, address(token), CAMPAIGN_THRESHOLD, CAMPAIGN_DEADLINE));
        vm.prank(CONTRIBUTOR);
        token.approve(address(campaign), PREMINT_AMOUNT);
    }

    function test_recoverToken_Revert_NonAdmin() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, CONTRIBUTOR, campaign.ADMIN_ROLE())
        );
        vm.prank(CONTRIBUTOR);
        campaign.recoverToken(address(token2), CONTRIBUTOR, 0);
    }

    function test_recoverToken_Success_NonContributionToken() public {
        // Arrange - Send tokens directly to the contract
        token2.transfer(address(campaign), PREMINT_AMOUNT);

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignERC20V1.RecoveryMade(address(token2), ADMIN, PREMINT_AMOUNT);

        // Act
        vm.prank(ADMIN);
        campaign.recoverToken(address(token2), ADMIN, PREMINT_AMOUNT);

        // Assert - Check state
        assertEq(token2.balanceOf(address(campaign)), 0);
        assertEq(token2.balanceOf(ADMIN), PREMINT_AMOUNT);
    }

    function test_recoverToken_Success_ContributionToken() public {
        // Arrange - Make contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD);
        uint256 initialTotalContributions = campaign.totalContributions();
        uint256 initialContributions = campaign.contributions(CONTRIBUTOR);

        // Arrange - Send tokens directly
        vm.prank(CONTRIBUTOR);
        token.transfer(address(campaign), CAMPAIGN_THRESHOLD);
        assertEq(initialTotalContributions, campaign.totalContributions());
        assertEq(initialContributions, campaign.contributions(CONTRIBUTOR));

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignERC20V1.RecoveryMade(address(token), CONTRIBUTOR, CAMPAIGN_THRESHOLD);

        // Act
        vm.prank(ADMIN);
        campaign.recoverToken(address(token), CONTRIBUTOR, CAMPAIGN_THRESHOLD);

        // Assert - Check state
        assertEq(token.balanceOf(address(campaign)), campaign.totalContributions());
        assertEq(initialTotalContributions, campaign.totalContributions());
        assertEq(initialContributions, campaign.contributions(CONTRIBUTOR));
    }

    function test_recoverToken_Success_ContributionTokenAfterTransferContributions() public {
        // Arrange - Make contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD);
        uint256 initialTotalContributions = campaign.totalContributions();
        uint256 initialContributions = campaign.contributions(CONTRIBUTOR);
        assertEq(true, campaign.isCampaignCompleted());

        // Arrange - Send tokens directly
        vm.prank(CONTRIBUTOR);
        token.transfer(address(campaign), CAMPAIGN_THRESHOLD);
        assertEq(initialTotalContributions, campaign.totalContributions());
        assertEq(initialContributions, campaign.contributions(CONTRIBUTOR));

        // Arrange - Transfer half of contributions
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD / 2);

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignERC20V1.RecoveryMade(address(token), CONTRIBUTOR, CAMPAIGN_THRESHOLD);

        // Act
        vm.prank(ADMIN);
        campaign.recoverToken(address(token), CONTRIBUTOR, CAMPAIGN_THRESHOLD);

        // Assert - Check state
        assertEq(token.balanceOf(address(campaign)), campaign.totalContributions() - campaign.contributionTransferred());
        assertEq(initialTotalContributions, campaign.totalContributions());
        assertEq(initialContributions, campaign.contributions(CONTRIBUTOR));
        assertEq(campaign.contributionTransferred(), CAMPAIGN_THRESHOLD / 2);
    }

    function test_recoverToken_Revert_RecoverTokenInExcessOfDirectlySent() public {
        // Arrange - Make contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD);
        uint256 initialTotalContributions = campaign.totalContributions();
        uint256 initialContributions = campaign.contributions(CONTRIBUTOR);

        // Arrange - Send tokens directly
        vm.prank(CONTRIBUTOR);
        token.transfer(address(campaign), CAMPAIGN_THRESHOLD);
        assertEq(initialTotalContributions, campaign.totalContributions());
        assertEq(initialContributions, campaign.contributions(CONTRIBUTOR));

        // Assert - Check revert
        vm.expectRevert(CampaignERC20V1.InsufficientBalanceForRecovery.selector);

        // Act
        vm.prank(ADMIN);
        campaign.recoverToken(address(token), CONTRIBUTOR, CAMPAIGN_THRESHOLD + 1);
    }

    function test_recoverToken_Revert_RecoverTokenInExcessOfDirectlySentAfterTransferContributions() public {
        // Arrange - Complete contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution(CAMPAIGN_THRESHOLD);
        uint256 initialTotalContributions = campaign.totalContributions();
        uint256 initialContributions = campaign.contributions(CONTRIBUTOR);
        assertEq(true, campaign.isCampaignCompleted());

        // Arrange - Send tokens directly
        vm.prank(CONTRIBUTOR);
        token.transfer(address(campaign), CAMPAIGN_THRESHOLD);
        assertEq(initialTotalContributions, campaign.totalContributions());
        assertEq(initialContributions, campaign.contributions(CONTRIBUTOR));

        // Arrange - Transfer half of contributions
        vm.prank(ADMIN);
        campaign.transferContributions(ADMIN, CAMPAIGN_THRESHOLD / 2);

        // Assert - Check revert
        vm.expectRevert(CampaignERC20V1.InsufficientBalanceForRecovery.selector);

        // Act - Try to recover more than was sent directly
        vm.prank(ADMIN);
        campaign.recoverToken(address(token), CONTRIBUTOR, CAMPAIGN_THRESHOLD + 1);
    }
}
