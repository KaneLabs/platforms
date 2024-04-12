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
import { MockERC20 } from "../utils/MockERC20.sol";

// Unit tests for 'recoverToken' function
contract CampaignETHV1RecoverTokenTest is TestBase {
    ICampaignFactoryV1 public campaignFactory;
    ICampaignETHV1 public campaign;
    IERC20 public token;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
        token = new MockERC20("MockToken", "MockToken", PREMINT_AMOUNT);
        vm.deal(CONTRIBUTOR, PREMINT_AMOUNT);
        token.transfer(CONTRIBUTOR, PREMINT_AMOUNT);
        campaign = ICampaignETHV1(campaignFactory.createCampaignETH(ADMIN, CAMPAIGN_THRESHOLD, CAMPAIGN_DEADLINE));
    }

    function test_recoverToken_Revert_NonAdmin() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, CONTRIBUTOR, campaign.ADMIN_ROLE())
        );
        vm.prank(CONTRIBUTOR);
        campaign.recoverToken(address(token), CONTRIBUTOR, 0);
        assertEq(address(campaign).balance, 0);
    }

    function test_recoverToken_Success() public {
        // Arrange - Send tokens directly to the contract
        vm.prank(CONTRIBUTOR);
        token.transfer(address(campaign), PREMINT_AMOUNT);

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.RecoveryMade(address(token), ADMIN, PREMINT_AMOUNT);

        // Act
        vm.prank(ADMIN);
        campaign.recoverToken(address(token), ADMIN, PREMINT_AMOUNT);

        // Assert - Check state
        assertEq(token.balanceOf(address(campaign)), 0);
        assertEq(token.balanceOf(ADMIN), PREMINT_AMOUNT);
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }

    function test_recoverToken_Success_WithExistingContribution() public {
        // Arrange - Make contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD}();
        uint256 initialTotalContributions = campaign.totalContributions();
        uint256 initialContributions = campaign.contributions(CONTRIBUTOR);

        // Arrange - Send tokens directly
        vm.prank(CONTRIBUTOR);
        token.transfer(address(campaign), CAMPAIGN_THRESHOLD);
        assertEq(initialTotalContributions, campaign.totalContributions());
        assertEq(initialContributions, campaign.contributions(CONTRIBUTOR));

        // Assert - Check event
        vm.expectEmit(true, true, true, true);
        emit CampaignETHV1.RecoveryMade(address(token), CONTRIBUTOR, CAMPAIGN_THRESHOLD);

        // Act
        vm.prank(ADMIN);
        campaign.recoverToken(address(token), CONTRIBUTOR, CAMPAIGN_THRESHOLD);

        // Assert - Check state
        assertEq(token.balanceOf(address(campaign)), 0);
        assertEq(initialTotalContributions, campaign.totalContributions());
        assertEq(initialContributions, campaign.contributions(CONTRIBUTOR));
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }

    function test_recoverToken_Success_ContributionTokenAfterTransferContributions() public {
        // Arrange - Make contribution
        vm.prank(CONTRIBUTOR);
        campaign.submitContribution{value: CAMPAIGN_THRESHOLD}();
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
        emit CampaignETHV1.RecoveryMade(address(token), CONTRIBUTOR, CAMPAIGN_THRESHOLD);

        // Act
        vm.prank(ADMIN);
        campaign.recoverToken(address(token), CONTRIBUTOR, CAMPAIGN_THRESHOLD);

        // Assert - Check state
        assertEq(initialTotalContributions, campaign.totalContributions());
        assertEq(initialContributions, campaign.contributions(CONTRIBUTOR));
        assertEq(campaign.contributionTransferred(), CAMPAIGN_THRESHOLD / 2);
        assertEq(address(campaign).balance, campaign.totalContributions() - campaign.contributionTransferred());
    }
}
