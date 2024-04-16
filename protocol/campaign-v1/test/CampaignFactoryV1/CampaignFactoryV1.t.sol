// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { TestBase } from "../TestBase.sol";
import { Vm } from "forge-std/Vm.sol";
import { CampaignFactoryV1 } from "../../src/CampaignFactoryV1.sol";
import { CampaignERC20V1 } from "../../src/CampaignERC20V1.sol";
import { CampaignETHV1 } from "../../src/CampaignETHV1.sol";
import { ICampaignERC20V1 } from "../../src/ICampaignERC20V1.sol";
import { ICampaignETHV1 } from "../../src/ICampaignETHV1.sol";
import { ICampaignFactoryV1 } from "../../src/ICampaignFactoryV1.sol";

contract CampaignFactoryV1Test is TestBase {
    ICampaignFactoryV1 public campaignFactory;

    function setUp() public preSetup {
        campaignFactory = new CampaignFactoryV1();
    }

    function test_Deploy_CorrectInitialState() public {
        assertFalse(address(campaignFactory) == address(0), "test_Deploy_CorrectInitializedState error - campaignFactory has zero address");
        assertFalse(campaignFactory.campaignERC20V1Implementation() == address(0), "test_Deploy_CorrectInitializedState error - campaign implementation has zero address");
        assertFalse(campaignFactory.campaignETHV1Implementation() == address(0), "test_Deploy_CorrectInitializedState error - campaign implementation has zero address");
    }

    function test_createCampaignERC20_Revert_InputValidationError() public {
        vm.expectRevert(CampaignERC20V1.InitialAdminZeroAddress.selector);
        campaignFactory.createCampaignERC20(address(0), address(0), 0, 0);
        vm.expectRevert(CampaignERC20V1.ContributionTokenZeroAddress.selector);
        campaignFactory.createCampaignERC20(ADMIN, address(0), 0, 0);
        vm.expectRevert(CampaignERC20V1.ContributionThresholdZero.selector);
        campaignFactory.createCampaignERC20(ADMIN, TOKEN, 0, 0);
        vm.expectRevert(CampaignERC20V1.InitialContributionDeadlineBeforeCurrentTime.selector);
        campaignFactory.createCampaignERC20(ADMIN, TOKEN, 1, 0);
    }

    function test_createCampaignETH_Revert_InputValidationError() public {
        vm.expectRevert(CampaignERC20V1.InitialAdminZeroAddress.selector);
        campaignFactory.createCampaignETH(address(0), 0, 0);
        vm.expectRevert(CampaignERC20V1.ContributionThresholdZero.selector);
        campaignFactory.createCampaignETH(ADMIN, 0, 0);
        vm.expectRevert(CampaignERC20V1.InitialContributionDeadlineBeforeCurrentTime.selector);
        campaignFactory.createCampaignETH(ADMIN, 1, 0);
    }

    function test_createCampaignERC20_canCreateCampaign() public {
        vm.recordLogs();
        address campaignAddress = campaignFactory.createCampaignERC20(ADMIN, TOKEN, 1, STARTING_TIMESTAMP * 2);
        assertFalse(campaignAddress == address(0), "test_createCampaignERC20_canCreateCampaign error - campaign has zero address");

        // Check the CampaignERC20Created event

        Vm.Log[] memory entries = vm.getRecordedLogs();
        // 2 events are emitted - AccessControl.RoleGranted then CampaignFactoryV1.CampaignERC20Created
        assertEq(entries.length, 2);
        // We are only interested in checking the second event - CampaignFactoryV1.CampaignERC20Created
        assertEq(entries[1].topics.length, 4);
        assertEq(entries[1].topics[0], keccak256("CampaignERC20Created(address,address,address,uint256,uint256)"), "test_createCampaignERC20_canCreateCampaign error - CampaignERC20Created was not detected");
        assertEq(entries[1].topics[1], addressToBytes32(campaignAddress), "test_createCampaignERC20_canCreateCampaign error -  CampaignERC20Created event has wrong 'campaignAddress' param");
        assertEq(entries[1].topics[2], addressToBytes32(ADMIN), "test_createCampaignERC20_canCreateCampaign error -  CampaignERC20Created event has wrong 'initialAdmin' param");
        assertEq(entries[1].topics[3], addressToBytes32(TOKEN), "test_createCampaignERC20_canCreateCampaign error -  CampaignERC20Created event has wrong 'contributionToken' param");
        (uint256 emitted_contributionThreshold, uint256 emitted_contributionDeadline) = abi.decode(entries[1].data, (uint256, uint256));
        assertEq(emitted_contributionThreshold, 1, "test_createCampaignERC20_canCreateCampaign error -  CampaignERC20Created event has wrong 'contributionThreshold' param");
        assertEq(emitted_contributionDeadline, STARTING_TIMESTAMP * 2, "test_createCampaignERC20_canCreateCampaign error -  CampaignERC20Created event has wrong 'contributionDeadline' param");

        // Check that campaign has expected params after initialization
        ICampaignERC20V1 campaign = ICampaignERC20V1(campaignAddress);
        assertEq(campaign.isCampaignCompleted(), false);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.adminCount(), 1);
        assertEq(campaign.contributionToken(), TOKEN);
        assertEq(campaign.contributionThreshold(), 1);
        assertEq(campaign.contributionDeadline(), STARTING_TIMESTAMP * 2);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), 0);
        assertEq(campaign.isContributionDeadlineExceeded(), false);
    }

    function test_createCampaignETH_canCreateCampaign() public {
        vm.recordLogs();
        address campaignAddress = campaignFactory.createCampaignETH(ADMIN, 1, STARTING_TIMESTAMP * 2);
        assertFalse(campaignAddress == address(0), "test_createCampaignETH_canCreateCampaign error - campaign has zero address");

        // Check the CampaignETHCreated event

        Vm.Log[] memory entries = vm.getRecordedLogs();
        // 2 events are emitted - AccessControl.RoleGranted then CampaignFactoryV1.CampaignETHCreated
        assertEq(entries.length, 2);
        // We are only interested in checking the second event - CampaignFactoryV1.CampaignETHCreated
        assertEq(entries[1].topics.length, 3);
        assertEq(entries[1].topics[0], keccak256("CampaignETHCreated(address,address,uint256,uint256)"), "test_createCampaignETH_canCreateCampaign error - CampaignETHCreated was not detected");
        assertEq(entries[1].topics[1], addressToBytes32(campaignAddress), "test_createCampaignETH_canCreateCampaign error -  CampaignETHCreated event has wrong 'campaignAddress' param");
        assertEq(entries[1].topics[2], addressToBytes32(ADMIN), "test_createCampaignETH_canCreateCampaign error -  CampaignETHCreated event has wrong 'initialAdmin' param");
        (uint256 emitted_contributionThreshold, uint256 emitted_contributionDeadline) = abi.decode(entries[1].data, (uint256, uint256));
        assertEq(emitted_contributionThreshold, 1, "test_createCampaignETH_canCreateCampaign error -  CampaignETHCreated event has wrong 'contributionThreshold' param");
        assertEq(emitted_contributionDeadline, STARTING_TIMESTAMP * 2, "test_createCampaignETH_canCreateCampaign error -  CampaignETHCreated event has wrong 'contributionDeadline' param");

        // Check that campaign has expected params after initialization
        ICampaignETHV1 campaign = ICampaignETHV1(campaignAddress);
        assertEq(campaign.isCampaignCompleted(), false);
        assertEq(campaign.isCampaignInitialized(), true);
        assertEq(campaign.adminCount(), 1);
        assertEq(campaign.contributionThreshold(), 1);
        assertEq(campaign.contributionDeadline(), STARTING_TIMESTAMP * 2);
        assertEq(campaign.contributionTransferred(), 0);
        assertEq(campaign.totalContributions(), 0);
        assertEq(campaign.isContributionDeadlineExceeded(), false);
    }
}
