// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { TestBase } from "../TestBase.sol";
import { Vm } from "forge-std/Vm.sol";
import { CampaignETHV1 } from "../../src/CampaignETHV1.sol";
import { ICampaignETHV1 } from "../../src/ICampaignETHV1.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

// Test contract at deploy state, and before 'initialize' is called
contract CampaignETHV1DeployTest is TestBase {
    ICampaignETHV1 public campaign;

    function setUp() public preSetup {
        campaign = new CampaignETHV1();
    }

    function test_Deploy_CorrectInitialState() public {
        assertFalse(address(campaign) == address(0));
        assertEq(campaign.isCampaignCompleted(), false);
        assertEq(campaign.isCampaignInitialized(), false);
        assertEq(campaign.adminCount(), 0);
        assertEq(campaign.contributionThreshold(), 0);
        assertEq(campaign.contributionDeadline(), 0);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), 0);
        assertEq(campaign.isContributionDeadlineExceeded(), false);
    }

    function test_submitContribution_revert_NotInitialized() public {
        vm.expectRevert(CampaignETHV1.NotInitialized.selector);
        campaign.submitContribution();
    }

    function test_withdrawContribution_revert_NotInitialized() public {
        vm.expectRevert(CampaignETHV1.NotInitialized.selector);
        campaign.withdrawContribution(0);
    }

    // Before initialization, there is no admin. Hence no one can call admin functions.
    function test_extendContributionDeadline_revert_NotInitialized() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, ADMIN, campaign.ADMIN_ROLE())
        );
        vm.prank(ADMIN);
        campaign.extendContributionDeadline(0);
    }

    function test_rejectContributions_revert_NotInitialized() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, ADMIN, campaign.ADMIN_ROLE())
        );
        address[] memory rejectees = new address[](1);
        rejectees[0] = address(0);
        vm.prank(ADMIN);
        campaign.rejectContributions(rejectees);
    }

    function test_transferContributions_revert_NotInitialized() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, ADMIN, campaign.ADMIN_ROLE())
        );
        vm.prank(ADMIN);
        campaign.transferContributions(address(0), 0);
    }

    function test_grantAdmin_revert_NotInitialized() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, ADMIN, campaign.ADMIN_ROLE())
        );
        vm.prank(ADMIN);
        campaign.grantAdmin(address(0));
    }

    function test_revokeAdmin_revert_NotInitialized() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, ADMIN, campaign.ADMIN_ROLE())
        );
        vm.prank(ADMIN);
        campaign.revokeAdmin(address(0));
    }

    function test_recoverToken_revert_NotInitialized() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, ADMIN, campaign.ADMIN_ROLE())
        );
        vm.prank(ADMIN);
        campaign.recoverToken(address(0), address(0), 0);
    }

    // @dev - This is a test of a critical assumption - that direct ETH transfer to the contract should fail without a `receive` or `fallback` function as per Solidity docs - https://docs.soliditylang.org/en/latest/contracts.html#receive-ether-function
    function test_revert_directEtherTransfer() public {
        assertGe(msg.sender.balance, 1 ether);
        vm.expectRevert();
        payable(address(campaign)).transfer(0.1 ether);
        vm.expectRevert();
        payable(address(campaign)).send(0.1 ether);
        vm.expectRevert();
        payable(address(campaign)).call{value: 0.1 ether}("");
        assertEq(address(campaign).balance, 0);
    }
}
