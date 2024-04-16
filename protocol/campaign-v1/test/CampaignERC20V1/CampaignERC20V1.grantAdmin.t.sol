// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Vm } from "forge-std/Vm.sol";

import { TestBase } from "../TestBase.sol";
import { CampaignERC20V1 } from "../../src/CampaignERC20V1.sol";
import { CampaignFactoryV1 } from "../../src/CampaignFactoryV1.sol";
import { ICampaignERC20V1 } from "../../src/ICampaignERC20V1.sol";
import { ICampaignFactoryV1 } from "../../src/ICampaignFactoryV1.sol";

// Unit tests for 'grantAdmin' function
contract CampaignERC20V1GrantAdminTest is TestBase {
    ICampaignFactoryV1 public campaignFactory;
    ICampaignERC20V1 public campaign;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
        campaign = ICampaignERC20V1(campaignFactory.createCampaignERC20(ADMIN, address(TOKEN), CAMPAIGN_THRESHOLD, CAMPAIGN_DEADLINE));
    }

    function test_grantAdmin_Revert_NonAdmin() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, CONTRIBUTOR, campaign.ADMIN_ROLE())
        );
        vm.prank(CONTRIBUTOR);
        campaign.grantAdmin(CONTRIBUTOR);
    }

    function test_grantAdmin_Revert_CannotGrantAdminToZeroAddress() public {
        vm.expectRevert(CampaignERC20V1.CannotGrantAdminToZeroAddress.selector);
        vm.prank(ADMIN);
        campaign.grantAdmin(address(0));
    }

    function test_grantAdmin_Success() public {
        // Assert - Check events
        vm.expectEmit(true, true, true, true);
        emit IAccessControl.RoleGranted(campaign.ADMIN_ROLE(), ADMIN_2, ADMIN);

        // Act
        vm.prank(ADMIN);
        bool success = campaign.grantAdmin(ADMIN_2);

        // Assert - Check state
        assertEq(campaign.adminCount(), 2);
        assertEq(success, true);
    }

    function test_grantAdmin_GrantToExisingAdmin() public {
        // Act
        vm.prank(ADMIN);
        bool success = campaign.grantAdmin(ADMIN);

        // Assert - Check state
        assertEq(campaign.adminCount(), 1);
        assertEq(success, false);
    }
}
