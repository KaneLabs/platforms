// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./Campaign.sol";
import "./CampaignERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CampaignFactory {
  // Event to log the creation of a new Campaign contract
  event CampaignCreated(
    address campaignAddress,
    address sponsor,
    uint256 threshold,
    string name
  );

  event CampaignERC20Created(
    address campaignAddress,
    address sponsor,
    uint256 threshold,
    string name,
    address tokenAddress
  );

  // Array to store addresses of all created campaigns
  address[] public deployedCampaigns;
  address[] public deployedERC20Campaigns;

  // Function to create a new Campaign
  function createCampaign(uint256 _threshold, string memory _name) public {
    Campaign newCampaign = new Campaign(payable(msg.sender), _threshold, _name);
    address newCampaignAddress = address(newCampaign);
    deployedCampaigns.push(newCampaignAddress);
    emit CampaignCreated(newCampaignAddress, msg.sender, _threshold, _name);
  }

  function createCampaignERC20(
    uint256 _threshold,
    string memory _name,
    IERC20 _token
  ) public {
    CampaignERC20 newCampaign = new CampaignERC20(
      payable(msg.sender),
      _threshold,
      _name,
      _token
    );
    address newCampaignAddress = address(newCampaign);
    deployedERC20Campaigns.push(newCampaignAddress);
    emit CampaignERC20Created(
      newCampaignAddress,
      msg.sender,
      _threshold,
      _name,
      address(_token)
    );
  }

  // Function to get all deployed campaigns
  function getDeployedCampaigns() public view returns (address[] memory) {
    return deployedCampaigns;
  }

  function getDeployedERC20Campaigns() public view returns (address[] memory) {
    return deployedERC20Campaigns;
  }
}
