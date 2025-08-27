// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title StepCouponFactory
 * @dev Factory contract for minting Step-Coupon NFTs based on verified steps
 * @notice Users can mint coupons by providing proof of steps through ZK attestation
 */
contract StepCouponFactory is ERC721, AccessControl, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    Counters.Counter private _tokenIdCounter;

    struct StepCoupon {
        uint256 stepCount;          // Number of steps required for this coupon
        string geohash;             // Location geohash for redemption area
        uint256 expiryTimestamp;    // When the coupon expires
        uint256 mintTimestamp;      // When the coupon was minted
        address minter;             // Who minted the coupon
        bool isRedeemed;           // Whether the coupon has been redeemed
    }

    // Mapping from token ID to coupon data
    mapping(uint256 => StepCoupon) public stepCoupons;
    
    // Mapping from user to their total steps verified
    mapping(address => uint256) public verifiedSteps;
    
    // Mapping from user to last step verification timestamp
    mapping(address => uint256) public lastStepVerification;
    
    // Minimum steps required to mint a coupon
    uint256 public constant MIN_STEPS_FOR_COUPON = 1000;
    
    // Coupon validity period (7 days)
    uint256 public constant COUPON_VALIDITY_PERIOD = 7 days;
    
    // Cooldown period between step verifications (1 hour)
    uint256 public constant STEP_VERIFICATION_COOLDOWN = 1 hours;

    event CouponMinted(
        uint256 indexed tokenId,
        address indexed minter,
        uint256 stepCount,
        string geohash,
        uint256 expiryTimestamp
    );

    event StepsVerified(
        address indexed user,
        uint256 stepCount,
        uint256 timestamp,
        bytes32 proofHash
    );

    event CouponRedeemed(
        uint256 indexed tokenId,
        address indexed redeemer,
        address indexed merchant
    );

    constructor() ERC721("StepCoupon", "STEP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Verify steps and update user's step count
     * @param user The user whose steps are being verified
     * @param stepCount The number of steps to verify
     * @param proofHash Hash of the ZK proof for step verification
     */
    function verifySteps(
        address user,
        uint256 stepCount,
        bytes32 proofHash
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        require(user != address(0), "Invalid user address");
        require(stepCount > 0, "Step count must be positive");
        require(
            block.timestamp >= lastStepVerification[user] + STEP_VERIFICATION_COOLDOWN,
            "Verification cooldown not met"
        );

        verifiedSteps[user] += stepCount;
        lastStepVerification[user] = block.timestamp;

        emit StepsVerified(user, stepCount, block.timestamp, proofHash);
    }

    /**
     * @dev Mint a step coupon for the caller
     * @param geohash The geohash of the location where the coupon can be redeemed
     */
    function mintStepCoupon(string memory geohash) external nonReentrant whenNotPaused {
        require(bytes(geohash).length > 0, "Geohash cannot be empty");
        require(
            verifiedSteps[msg.sender] >= MIN_STEPS_FOR_COUPON,
            "Insufficient verified steps"
        );

        // Deduct steps for minting
        verifiedSteps[msg.sender] -= MIN_STEPS_FOR_COUPON;

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        uint256 expiryTimestamp = block.timestamp + COUPON_VALIDITY_PERIOD;

        stepCoupons[tokenId] = StepCoupon({
            stepCount: MIN_STEPS_FOR_COUPON,
            geohash: geohash,
            expiryTimestamp: expiryTimestamp,
            mintTimestamp: block.timestamp,
            minter: msg.sender,
            isRedeemed: false
        });

        _safeMint(msg.sender, tokenId);

        emit CouponMinted(
            tokenId,
            msg.sender,
            MIN_STEPS_FOR_COUPON,
            geohash,
            expiryTimestamp
        );
    }

    /**
     * @dev Mark a coupon as redeemed (called by Redeemer contract)
     * @param tokenId The ID of the token to redeem
     * @param merchant The merchant address redeeming the coupon
     */
    function redeemCoupon(uint256 tokenId, address merchant) external onlyRole(MINTER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        require(!stepCoupons[tokenId].isRedeemed, "Coupon already redeemed");
        require(block.timestamp <= stepCoupons[tokenId].expiryTimestamp, "Coupon expired");

        stepCoupons[tokenId].isRedeemed = true;

        emit CouponRedeemed(tokenId, ownerOf(tokenId), merchant);
        
        // Burn the token after redemption
        _burn(tokenId);
    }

    /**
     * @dev Check if a coupon is valid for redemption
     * @param tokenId The ID of the token to check
     * @return bool True if the coupon is valid
     */
    function isCouponValid(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) return false;
        
        StepCoupon memory coupon = stepCoupons[tokenId];
        return !coupon.isRedeemed && block.timestamp <= coupon.expiryTimestamp;
    }

    /**
     * @dev Get coupon details
     * @param tokenId The ID of the token
     * @return StepCoupon memory The coupon data
     */
    function getCoupon(uint256 tokenId) external view returns (StepCoupon memory) {
        require(_exists(tokenId), "Token does not exist");
        return stepCoupons[tokenId];
    }

    /**
     * @dev Get the next token ID to be minted
     * @return uint256 The next token ID
     */
    function getNextTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Pause the contract (emergency stop)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Override supportsInterface to include AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override _beforeTokenTransfer to add pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        require(!paused(), "Token transfer while paused");
    }
}