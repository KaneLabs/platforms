// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Vm } from "forge-std/Vm.sol";

import { TestBase } from "../TestBase.sol";
import { CampaignERC20V1 } from "../../src/CampaignERC20V1.sol";
import { CampaignFactoryV1 } from "../../src/CampaignFactoryV1.sol";
import { ICampaignERC20V1 } from "../../src/ICampaignERC20V1.sol";
import { ICampaignFactoryV1 } from "../../src/ICampaignFactoryV1.sol";

// Unit tests for 'initialize' function
contract CampaignERC20V1InitializeTest is TestBase {
    ICampaignERC20V1 public campaign;
    ICampaignFactoryV1 public campaignFactory;

    function setUp() public preSetup {
        campaign = new CampaignERC20V1();
        campaignFactory = new CampaignFactoryV1();
    }

    function test_Initialize_CanBeCalledOnceAfterDirectDeploy() public {
        campaign.initialize(ADMIN, address(TOKEN), 1, STARTING_TIMESTAMP * 2);

        // Test state is as expected
        assertEq(campaign.adminCount(), 1);
        assertEq(campaign.contributionToken(), address(TOKEN));
        assertEq(campaign.contributionThreshold(), 1);
        assertEq(campaign.contributionDeadline(), STARTING_TIMESTAMP * 2);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.isCampaignCompleted(), false);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), 0);
        assertEq(campaign.isContributionDeadlineExceeded(), false);
    }

    function test_Initialize_Revert_CalledTwice() public {
        campaign.initialize(ADMIN, TOKEN, 1, STARTING_TIMESTAMP * 2);
        vm.expectRevert(CampaignERC20V1.AlreadyInitialized.selector);
        campaign.initialize(ADMIN, TOKEN, 1, STARTING_TIMESTAMP * 2);
    }

    function test_Initialize_Revert_AfterCreatedByFactory() public {
        address newCampaign = campaignFactory.createCampaignERC20(ADMIN, TOKEN, 1, STARTING_TIMESTAMP * 2);
        vm.expectRevert(CampaignERC20V1.AlreadyInitialized.selector);
        ICampaignERC20V1(newCampaign).initialize(ADMIN, TOKEN, 1, STARTING_TIMESTAMP * 2);
    }
}
