// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract CampaignERC20 {
  uint256 public threshold;
  address public sponsor;
  string public name;
  IERC20 public token;

  mapping(address => uint256) public contributions;
  uint256 public totalContributions;
  bool openToContributions;

  using EnumerableSet for EnumerableSet.AddressSet;
  EnumerableSet.AddressSet private authorizedContributors;

  struct Tier {
    uint256 price;
    string name;
    uint256 limit;
  }

  Tier[] public tiers;

  // Events
  event ContributionReceived(address contributor, uint256 amount);
  event ContributorAuthorized(address contributor);
  event RefundIssued(address contributor, uint256 amount);
  event FundsWithdrawn(address sponsor, uint256 amount);

  constructor(
    address payable _sponsor,
    uint256 _threshold,
    string memory _name,
    IERC20 _token
  ) {
    sponsor = _sponsor;
    threshold = _threshold;
    name = _name;
    token = _token;
    totalContributions = 0;
    openToContributions = true;
  }

  function addTier(uint256 _price, string memory _name, uint256 _limit) public {
    require(msg.sender == sponsor, "Only the sponsor can add tiers");
    tiers.push(Tier(_price, _name, _limit));
  }

  function contribute(uint256 _amount) public {
    require(
      openToContributions,
      "The campaign isn't accepting contributions right now"
    );
    token.transferFrom(msg.sender, address(this), _amount);
    contributions[msg.sender] += _amount;
    totalContributions += _amount;
    emit ContributionReceived(msg.sender, _amount);
  }

  function authorizeContributor(address contributor) public {
    require(
      msg.sender == sponsor,
      "Only the campaign sponsor can authorize contributors"
    );
    authorizedContributors.add(contributor);
    emit ContributorAuthorized(contributor);
  }

  function refund(uint256 amount) public {
    require(
      totalContributions < threshold,
      "The campaign has reached its threshold, so refunds are no longer possible"
    );
    uint256 contribution = contributions[msg.sender];
    require(amount <= contribution, "Refund amount is more than contribution");
    contributions[msg.sender] = contribution - amount;
    token.transfer(msg.sender, amount);

    emit RefundIssued(msg.sender, amount);
  }

  function withdraw(uint256 amount) public {
    require(msg.sender == sponsor, "Only the sponsor can withdraw funds");
    require(
      totalContributions >= threshold,
      "As the organizer, you can only withdraw once the contribution threshold is met"
    );
    require(
      amount <= token.balanceOf(address(this)),
      "More funds requested than available"
    );
    token.transfer(sponsor, amount);

    emit FundsWithdrawn(sponsor, amount);
  }

  // TODO implement a way sponsor can refund all contributors even after threshold
  // maybe just a manual override setting
}
