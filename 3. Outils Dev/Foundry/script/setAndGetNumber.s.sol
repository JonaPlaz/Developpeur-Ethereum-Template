// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;
import {DevOpsTools} from "foundry-devops/src/DevOpsTools.sol";
import {SimpleStorage} from "../src/SimpleStorage.sol";
import {Script, console} from "forge-std/Script.sol";
contract InteractSimpleStorage is Script {
    function interactSimpleStorage(address mostRecentlyDeployed) public {
        vm.startBroadcast();
        SimpleStorage(payable(mostRecentlyDeployed)).setNumber(888);
        uint256 number = SimpleStorage(payable(mostRecentlyDeployed))
            .getNumber();
        vm.stopBroadcast();
        console.log("SimpleStorage getNumber %s", number);
    }
    function run() external {
        address mostRecentlyDeployed = DevOpsTools.get_most_recent_deployment(
            "SimpleStorage",
            block.chainid
        );
        interactSimpleStorage(mostRecentlyDeployed);
    }
}
