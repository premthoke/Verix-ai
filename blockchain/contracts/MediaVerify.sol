// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MediaVerify
 * @notice Stores and retrieves AI deepfake detection results for media files.
 *         Only the contract owner (the Verix AI backend wallet) can write records.
 *         Anyone can read records (public verification).
 * @dev hash → result mapping. The hash is the SHA-256 hex string of the media file.
 */
contract MediaVerify is Ownable {

    /// @dev SHA-256 hash (hex string) → AI detection result string ("Real" / "Fake")
    mapping(string => string) private media;

    /**
     * @notice Emitted when a new media verification record is stored on-chain.
     * @param hash   The SHA-256 hex hash of the verified media file.
     * @param result The AI detection result ("Real" or "Fake").
     * @param timestamp The block timestamp when the record was stored.
     */
    event MediaStored(
        string indexed hash,
        string result,
        uint256 timestamp
    );

    /**
     * @param initialOwner The address that will own this contract (backend wallet).
     *                     Only this address can call storeMedia().
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Store an AI verification result on-chain.
     *         Restricted to the contract owner — only the Verix AI backend wallet
     *         can write records, preventing forgery by arbitrary wallets.
     * @param hash   SHA-256 hex hash of the uploaded media file.
     * @param result AI detection result string.
     */
    function storeMedia(string memory hash, string memory result)
        public
        onlyOwner
    {
        media[hash] = result;
        emit MediaStored(hash, result, block.timestamp);
    }

    /**
     * @notice Look up the stored AI result for a given file hash.
     *         Public — anyone can verify a record without authentication.
     * @param hash SHA-256 hex hash of the media file.
     * @return The stored result string, or "" if no record exists.
     */
    function verifyMedia(string memory hash)
        public
        view
        returns (string memory)
    {
        return media[hash];
    }
}