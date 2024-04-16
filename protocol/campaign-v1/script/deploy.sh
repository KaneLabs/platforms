#!/bin/bash

# Get current environment variables defined in .env
source .env
echo "Running deploy script"
forge script script/Deploy.s.sol:ForaCampaignDeployScript --ffi --rpc-url $ETH_RPC_URL --slow --broadcast --verify -vvvv