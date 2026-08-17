// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LandRegistry {
    struct Record {
        string documentHash;
        uint256 timestamp;
    }

    // Mapping from property ID to its record
    mapping(string => Record) private registry;

    event HashCommitted(string propertyId, string documentHash, uint256 timestamp);

    /**
     * @dev Commits a new hash for a property ID
     * @param propertyId The unique identifier of the property
     * @param documentHash The SHA-256 hash of the property data
     */
    function commitHash(string memory propertyId, string memory documentHash) public {
        registry[propertyId] = Record({
            documentHash: documentHash,
            timestamp: block.timestamp
        });
        
        emit HashCommitted(propertyId, documentHash, block.timestamp);
    }

    /**
     * @dev Retrieves the stored hash and timestamp for a given property ID
     * @param propertyId The unique identifier of the property
     */
    function getHash(string memory propertyId) public view returns (string memory, uint256) {
        Record memory record = registry[propertyId];
        return (record.documentHash, record.timestamp);
    }
}
