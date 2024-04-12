// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Vm } from "forge-std/Vm.sol";

import { TestBase } from "../TestBase.sol";
import { CampaignERC20V1 } from "../../src/CampaignERC20V1.sol";
import { CampaignFactoryV1 } from "../../src/CampaignFactoryV1.sol";
import { ICampaignERC20V1 } from "../../src/ICampaignERC20V1.sol";
import { ICampaignFactoryV1 } from "../../src/ICampaignFactoryV1.sol";

// Unit tests for 'revokeAdmin' function
contract CampaignERC20V1RevokeAdminTest is TestBase {
    ICampaignFactoryV1 public campaignFactory;
    ICampaignERC20V1 public campaign;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
        campaign = ICampaignERC20V1(campaignFactory.createCampaignERC20(ADMIN, address(TOKEN), CAMPAIGN_THRESHOLD, CAMPAIGN_DEADLINE));
    }

    function test_revokeAdmin_Revert_NonAdmin() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, CONTRIBUTOR, campaign.ADMIN_ROLE())
        );
        vm.prank(CONTRIBUTOR);
        campaign.revokeAdmin(ADMIN);
    }

    function test_revokeAdmin_Revert_CannotHaveZeroAdmins() public {
        vm.expectRevert(CampaignERC20V1.CannotHaveZeroAdmins.selector);
        vm.prank(ADMIN);
        campaign.revokeAdmin(ADMIN);
    }

    function test_revokeAdmin_Success() public {
        // Arrange - Make another admin
        vm.prank(ADMIN);
        campaign.grantAdmin(ADMIN_2);

        // Assert - Check events
        vm.expectEmit(true, true, true, true);
        emit IAccessControl.RoleRevoked(campaign.ADMIN_ROLE(), ADMIN_2, ADMIN);

        // Act
        vm.prank(ADMIN);
        bool success = campaign.revokeAdmin(ADMIN_2);

        // Assert - Check state
        assertEq(campaign.adminCount(), 1);
        assertEq(success, true);
    }

    function test_revokeAdmin_RevokeSelf() public {
        // Arrange - Make another admin
        vm.prank(ADMIN);
        campaign.grantAdmin(ADMIN_2);

        // Assert - Check events
        vm.expectEmit(true, true, true, true);
        emit IAccessControl.RoleRevoked(campaign.ADMIN_ROLE(), ADMIN_2, ADMIN_2);

        // Act
        vm.prank(ADMIN_2);
        bool success = campaign.revokeAdmin(ADMIN_2);

        // Assert - Check state
        assertEq(campaign.adminCount(), 1);
        assertEq(success, true);
    }
}
