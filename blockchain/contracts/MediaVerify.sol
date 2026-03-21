// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MediaVerify {

    struct Media {
        string hash;
        string result;
        uint timestamp;
    }

    mapping(string => Media) public mediaRecords;

    function storeMedia(string memory _hash, string memory _result) public {
        mediaRecords[_hash] = Media(_hash, _result, block.timestamp);
    }

    function verifyMedia(string memory _hash) public view returns (string memory, uint) {
        Media memory m = mediaRecords[_hash];
        return (m.result, m.timestamp);
    }
}