// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 premint
    ) ERC20(name, symbol) {
        _mint(msg.sender, premint);
    }

    function mint(address user, uint256 amount) external {
        _mint(user, amount);
    }
}
