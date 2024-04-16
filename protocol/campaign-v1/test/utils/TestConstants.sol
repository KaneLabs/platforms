// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { Vm } from "forge-std/Vm.sol";

abstract contract TestConstants {
    address internal constant ADMIN = address(bytes20(keccak256("ADMIN")));
    address internal constant ADMIN_2 = address(bytes20(keccak256("ADMIN_2")));
    address internal constant CONTRIBUTOR = address(bytes20(keccak256("CONTRIBUTOR")));
    address internal constant CONTRIBUTOR_2 = address(bytes20(keccak256("CONTRIBUTOR_2")));
    address internal constant TOKEN = address(bytes20(keccak256("TOKEN")));

    uint256 internal constant STARTING_TIMESTAMP = 1e6;
    uint256 internal constant CAMPAIGN_DEADLINE = 2 * STARTING_TIMESTAMP;
    uint256 internal constant PREMINT_AMOUNT = 2e6;
    uint256 internal constant CAMPAIGN_THRESHOLD = 1e6;
}