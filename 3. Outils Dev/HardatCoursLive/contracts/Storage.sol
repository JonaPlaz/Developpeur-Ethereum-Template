// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.27;

import "hardhat/console.sol";

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract Storage {
    constructor(uint num) payable {
        number = num;
    }

    uint256 number;
    address payable public owner;

    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public {
        console.log("number avant : ", number);
        number = num;
        console.log("number apres : ", number);
    }

    /**
     * @dev Return value
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256) {
        return number;
    }
}
