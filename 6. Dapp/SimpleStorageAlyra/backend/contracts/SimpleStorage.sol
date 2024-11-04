// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.27;

contract SimpleStorage {
    uint private storedNumber;

    event NumberChanged(uint oldValue, uint newValue);

    function store(uint256 _number) public {
        emit NumberChanged(storedNumber, _number);
        storedNumber = _number;
    }

    function retrieve() public view returns (uint) {
        return storedNumber;
    }
}
