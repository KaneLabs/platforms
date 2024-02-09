// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/CampaignFactory.sol";
import "../src/Campaign.sol";
import { CampaignERC20 } from "../src/CampaignERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
  constructor(uint256 initialSupply) ERC20("TestToken", "TT") {
    _mint(msg.sender, initialSupply);
  }
}

contract CampaignFactoryTest is Test {
  CampaignFactory private factory;

  function setUp() public {
    factory = new CampaignFactory();
  }

  function testCreateCampaign() public {
    // Arrange
    uint256 threshold = 1 ether;
    string memory name = "Test Campaign";

    // Act
    // Set up the expectations for the event emission
    // The booleans correspond to the indexed parameters of the event
    // If the event has indexed parameters, set the corresponding boolean to true
    vm.expectEmit(true, true, true, true);
    factory.createCampaign(threshold, name);

    // Assert
    address[] memory deployedCampaigns = factory.getDeployedCampaigns();
    assertEq(deployedCampaigns.length, 1, "Should have created one campaign");

    Campaign createdCampaign = Campaign(deployedCampaigns[0]);
    assertEq(
      createdCampaign.sponsor(),
      address(this),
      "Sponsor should be set correctly"
    );
    assertEq(
      createdCampaign.threshold(),
      threshold,
      "Threshold should be set correctly"
    );
    assertEq(createdCampaign.name(), name, "Name should be set correctly");
  }

  function testCreateCampaignERC20() public {
    // Arrange
    uint256 threshold = 1 ether;
    string memory name = "Test ERC20 Campaign";
    IERC20 token = new TestToken(1000000 * 10 ** 18);

    // Act
    vm.expectEmit(true, true, true, true);
    factory.createCampaignERC20(threshold, name, token);

    // Assert
    address[] memory deployedERC20Campaigns = factory
      .getDeployedERC20Campaigns();
    assertEq(
      deployedERC20Campaigns.length,
      1,
      "Should have created one ERC20 campaign"
    );

    CampaignERC20 createdCampaign = CampaignERC20(deployedERC20Campaigns[0]);
    assertEq(
      createdCampaign.sponsor(),
      address(this),
      "Sponsor should be set correctly"
    );
    assertEq(
      createdCampaign.threshold(),
      threshold,
      "Threshold should be set correctly"
    );
    assertEq(createdCampaign.name(), name, "Name should be set correctly");
    assertEq(
      address(createdCampaign.token()),
      address(token),
      "Token should be set correctly"
    );
  }
}
