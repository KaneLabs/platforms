// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { TestConstants } from "./utils/TestConstants.sol";

abstract contract TestBase is Test, TestConstants {
    modifier preSetup() {
        vm.warp(STARTING_TIMESTAMP);
        _;
    }

    function addressToBytes32(address x) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(x)));
    }

}