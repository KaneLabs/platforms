// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { CampaignFactoryV1 } from '../src/CampaignFactoryV1.sol';
import { ICampaignFactoryV1 } from '../src/ICampaignFactoryV1.sol';

contract ForaCampaignDeployScript is Script {
    function run() public {
        // DEPLOYMENT SCRIPT
        console.log("Deploying CampaignFactoryV1 contract");
        uint256 deployerPrivateKey = vm.envUint("PRIV_KEY");
        vm.startBroadcast(deployerPrivateKey);
        ICampaignFactoryV1 campaignFactory = new CampaignFactoryV1();
        vm.stopBroadcast();
        console.log("Deployed CampaignFactoryV1 contract to ", address(campaignFactory));
    }
}
