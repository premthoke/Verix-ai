// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MediaVerify {

    mapping(string => string) private media;

    function storeMedia(string memory hash, string memory result) public {
        media[hash] = result;
    }

    function verifyMedia(string memory hash) public view returns (string memory) {
        return media[hash];
    }
}