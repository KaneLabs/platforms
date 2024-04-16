## SPEC

ROLES
===
- There will be 2 roles - Admin and Contributor
- At a high level, the Admin manages the campaign, and the Contributor provides contributions in a specified payment token 
- Admins can be added or removed at any time by an existing Admin. There must be at least one Admin at any time
- The contract deployer will be granted the initial sole Admin role

KEY PARAMETERS
===
- There are three parameters set at deployment: contribution token, contribution deadline, and contribution threshold
- The contract only accepts one contribution token - this cannot be changed after deployment. This can be either native ETH or any ERC20 token.
- The contribution deadline can be extended at any time prior to the finish date by an Admin. After the contribution deadline has passed, it cannot be changed.
- The contribution threshold cannot be changed after deployment.

CONTRIBUTIONS
===
- At any time before the contribution deadline, a Contributor can make a contribution in the specified contribution token
- At any time before the contribution deadline, a Contributor can withdraw their contribution
- At any time before the contribution deadline, an Admin can 'reject' a contribution - this will refund the contribution. The Contributor cannot attempt another contribution afterwards.
- If the contribution threshold is passed, then the contract will toggle to a 'campaign completed' state.
- When a campaign is completed, a contributor becomes ineligible to withdraw any contributions and admin/s become eligible to withdraw campaign contributions.

## Troubleshooting

Git submodules not downloaded
https://stackoverflow.com/questions/43686630/gitsubmodules-are-not-being-pulled-when-cloning-project