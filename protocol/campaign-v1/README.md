# Fora CampaignFactoryV1, CampaignERC20V1 and CampaignETHV1

# System requirements

- [Forge](https://github.com/foundry-rs/foundry)

# Unit Test Instructions

1. `forge test`

# Deployment Instructions

1. Create .env file and enter required parameters 'PRIV_KEY' and 'ETH_RPC_URL' as shown in .env.example

2. Compile the contracts - `forge build`

3. Run deploy script - `bash script/deploy.sh`

# View contract documentation

1. Build documentation and serve on `http://localhost:3000`

`bash script/serve-docs.sh`
