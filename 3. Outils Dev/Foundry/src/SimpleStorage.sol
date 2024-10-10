// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.28;

contract SimpleStorage {
    uint256 private number;

    function setNumber(uint256 _number) public {
        number = _number;
    }

    function getNumber() public view returns (uint256) {
        return number;
    }
}
