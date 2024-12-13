// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VideoAuthentication {
    struct VideoRecord {
        bytes32 videoHash;
        address signer;
        uint256 timestamp;
        string ipfsHash;  // We'll use this later for IPFS integration
    }
    
    // Mapping from video hash to record
    mapping(bytes32 => VideoRecord) public videos;
    
    // Event emitted when a new video is registered
    event VideoRegistered(
        address indexed signer,
        bytes32 indexed videoHash,
        uint256 timestamp,
        string ipfsHash
    );

    // Register a new video
    function registerVideo(bytes32 videoHash, string memory ipfsHash) public {
        require(videos[videoHash].signer == address(0), "Video already registered");
        
        videos[videoHash] = VideoRecord({
            videoHash: videoHash,
            signer: msg.sender,
            timestamp: block.timestamp,
            ipfsHash: ipfsHash
        });
        
        emit VideoRegistered(msg.sender, videoHash, block.timestamp, ipfsHash);
    }
    
    // Verify if a video was signed by a specific address
    function verifyVideo(bytes32 videoHash) public view returns (
        bool exists,
        address signer,
        uint256 timestamp,
        string memory ipfsHash
    ) {
        VideoRecord memory record = videos[videoHash];
        return (
            record.signer != address(0),
            record.signer,
            record.timestamp,
            record.ipfsHash
        );
    }
}