# CampaignFactoryV1

A user can deploy an ERC20 pool via `createCampaignERC20`

A user can deploy an ETH (or native gas token) pool via `createCampaignETH`

# CampaignERC20V1 / CampaignETHV1

## Contributor guide

A contributor can make a contribution via `submitContribution`

A contributor can withdraw their contribution via `withdrawContribution` 

## Admin guide

An admin can extend the contribution deadline via `extendContributionDeadline`

An admin can reject current contributions via `rejectContributions`

An admin can transfer funds from the contract to a desired address via `transferContributions`. Note that this is only allowed after the contribution threshold has been passed.

An admin can grant another address the admin role via `grantAdmin`

An admin can revoke the admin role from another address via `revokeAdmin`. Note that there must be at least one admin at any time.

An admin can recover tokens that were accidently sent to the contract via `recoverToken`.