// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MerchantBidRegistry
 * @dev Registry for merchants to create offers and bid on step coupons
 * @notice Merchants can register, create offers, and bid on available coupons
 */
contract MerchantBidRegistry is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    struct Merchant {
        string name;
        string description;
        string location;
        string geohash;
        address walletAddress;
        bool isActive;
        uint256 totalBids;
        uint256 successfulRedemptions;
        uint256 registrationTimestamp;
    }

    struct Offer {
        uint256 offerId;
        address merchant;
        string title;
        string description;
        uint256 discountPercentage;    // e.g., 20 for 20% off
        uint256 maxDiscountAmount;     // Maximum discount in wei (VERY tokens)
        uint256 minPurchaseAmount;     // Minimum purchase required in wei
        string applicableGeohash;      // Geohash where offer is valid
        uint256 validUntil;           // Expiry timestamp
        bool isActive;
        uint256 maxRedemptions;       // Maximum number of redemptions allowed
        uint256 currentRedemptions;   // Current number of redemptions
    }

    struct Bid {
        uint256 bidId;
        uint256 offerId;
        uint256 couponTokenId;
        address bidder;              // The merchant making the bid
        address couponOwner;         // Owner of the step coupon
        uint256 bidAmount;           // Amount in VERY tokens
        uint256 bidTimestamp;
        bool isAccepted;
        bool isCompleted;
    }

    // State variables
    mapping(address => Merchant) public merchants;
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => Bid) public bids;
    
    address[] public merchantAddresses;
    uint256[] public activeOfferIds;
    uint256[] public activeBidIds;

    uint256 private _nextOfferId = 1;
    uint256 private _nextBidId = 1;

    // VERY token contract (for payments)
    IERC20 public immutable veryToken;

    // Platform fee (in basis points, e.g., 10 = 0.1%)
    uint256 public platformFeeRate = 10;  // 0.1%
    address public feeRecipient;

    event MerchantRegistered(
        address indexed merchant,
        string name,
        string geohash
    );

    event OfferCreated(
        uint256 indexed offerId,
        address indexed merchant,
        string title,
        uint256 discountPercentage,
        string geohash
    );

    event BidPlaced(
        uint256 indexed bidId,
        uint256 indexed offerId,
        uint256 indexed couponTokenId,
        address bidder,
        address couponOwner,
        uint256 bidAmount
    );

    event BidAccepted(
        uint256 indexed bidId,
        address indexed couponOwner,
        address indexed merchant
    );

    event BidCompleted(
        uint256 indexed bidId,
        uint256 indexed couponTokenId,
        uint256 finalAmount
    );

    constructor(address _veryToken, address _feeRecipient) {
        require(_veryToken != address(0), "Invalid VERY token address");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        veryToken = IERC20(_veryToken);
        feeRecipient = _feeRecipient;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Register a new merchant
     * @param name Merchant name
     * @param description Merchant description
     * @param location Physical location description
     * @param geohash Geohash of merchant location
     */
    function registerMerchant(
        string memory name,
        string memory description,
        string memory location,
        string memory geohash
    ) external whenNotPaused {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(geohash).length > 0, "Geohash cannot be empty");
        require(!merchants[msg.sender].isActive, "Merchant already registered");

        merchants[msg.sender] = Merchant({
            name: name,
            description: description,
            location: location,
            geohash: geohash,
            walletAddress: msg.sender,
            isActive: true,
            totalBids: 0,
            successfulRedemptions: 0,
            registrationTimestamp: block.timestamp
        });

        merchantAddresses.push(msg.sender);

        emit MerchantRegistered(msg.sender, name, geohash);
    }

    /**
     * @dev Create a new offer
     * @param title Offer title
     * @param description Offer description
     * @param discountPercentage Discount percentage (e.g., 20 for 20%)
     * @param maxDiscountAmount Maximum discount amount in VERY tokens
     * @param minPurchaseAmount Minimum purchase amount required
     * @param applicableGeohash Geohash where offer is valid
     * @param validityDuration How long the offer is valid (in seconds)
     * @param maxRedemptions Maximum number of redemptions allowed
     */
    function createOffer(
        string memory title,
        string memory description,
        uint256 discountPercentage,
        uint256 maxDiscountAmount,
        uint256 minPurchaseAmount,
        string memory applicableGeohash,
        uint256 validityDuration,
        uint256 maxRedemptions
    ) external whenNotPaused {
        require(merchants[msg.sender].isActive, "Merchant not registered");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(discountPercentage > 0 && discountPercentage <= 100, "Invalid discount percentage");
        require(maxDiscountAmount > 0, "Invalid max discount amount");
        require(maxRedemptions > 0, "Invalid max redemptions");

        uint256 offerId = _nextOfferId++;

        offers[offerId] = Offer({
            offerId: offerId,
            merchant: msg.sender,
            title: title,
            description: description,
            discountPercentage: discountPercentage,
            maxDiscountAmount: maxDiscountAmount,
            minPurchaseAmount: minPurchaseAmount,
            applicableGeohash: applicableGeohash,
            validUntil: block.timestamp + validityDuration,
            isActive: true,
            maxRedemptions: maxRedemptions,
            currentRedemptions: 0
        });

        activeOfferIds.push(offerId);

        emit OfferCreated(
            offerId,
            msg.sender,
            title,
            discountPercentage,
            applicableGeohash
        );
    }

    /**
     * @dev Place a bid on a step coupon
     * @param offerId The offer ID to bid with
     * @param couponTokenId The step coupon token ID
     * @param couponOwner The owner of the step coupon
     * @param bidAmount The bid amount in VERY tokens
     */
    function placeBid(
        uint256 offerId,
        uint256 couponTokenId,
        address couponOwner,
        uint256 bidAmount
    ) external nonReentrant whenNotPaused {
        require(merchants[msg.sender].isActive, "Merchant not registered");
        require(offers[offerId].isActive, "Offer not active");
        require(offers[offerId].merchant == msg.sender, "Not your offer");
        require(block.timestamp <= offers[offerId].validUntil, "Offer expired");
        require(offers[offerId].currentRedemptions < offers[offerId].maxRedemptions, "Max redemptions reached");
        require(bidAmount > 0, "Bid amount must be positive");
        require(couponOwner != address(0), "Invalid coupon owner");

        // Transfer bid amount to contract (escrow)
        veryToken.safeTransferFrom(msg.sender, address(this), bidAmount);

        uint256 bidId = _nextBidId++;

        bids[bidId] = Bid({
            bidId: bidId,
            offerId: offerId,
            couponTokenId: couponTokenId,
            bidder: msg.sender,
            couponOwner: couponOwner,
            bidAmount: bidAmount,
            bidTimestamp: block.timestamp,
            isAccepted: false,
            isCompleted: false
        });

        activeBidIds.push(bidId);
        merchants[msg.sender].totalBids++;

        emit BidPlaced(
            bidId,
            offerId,
            couponTokenId,
            msg.sender,
            couponOwner,
            bidAmount
        );
    }

    /**
     * @dev Accept a bid (called by coupon owner)
     * @param bidId The bid ID to accept
     */
    function acceptBid(uint256 bidId) external nonReentrant whenNotPaused {
        Bid storage bid = bids[bidId];
        require(bid.couponOwner == msg.sender, "Not the coupon owner");
        require(!bid.isAccepted, "Bid already accepted");
        require(!bid.isCompleted, "Bid already completed");

        bid.isAccepted = true;

        emit BidAccepted(bidId, msg.sender, bid.bidder);
    }

    /**
     * @dev Complete a bid (called after coupon redemption)
     * @param bidId The bid ID to complete
     */
    function completeBid(uint256 bidId) external onlyRole(MANAGER_ROLE) {
        Bid storage bid = bids[bidId];
        require(bid.isAccepted, "Bid not accepted");
        require(!bid.isCompleted, "Bid already completed");

        bid.isCompleted = true;

        // Calculate platform fee
        uint256 platformFee = (bid.bidAmount * platformFeeRate) / 10000;
        uint256 merchantAmount = bid.bidAmount - platformFee;

        // Transfer amounts
        if (platformFee > 0) {
            veryToken.safeTransfer(feeRecipient, platformFee);
        }
        veryToken.safeTransfer(bid.couponOwner, merchantAmount);

        // Update merchant stats
        merchants[bid.bidder].successfulRedemptions++;
        offers[bid.offerId].currentRedemptions++;

        emit BidCompleted(bidId, bid.couponTokenId, merchantAmount);
    }

    /**
     * @dev Cancel a bid (if not accepted)
     * @param bidId The bid ID to cancel
     */
    function cancelBid(uint256 bidId) external nonReentrant {
        Bid storage bid = bids[bidId];
        require(bid.bidder == msg.sender || hasRole(MANAGER_ROLE, msg.sender), "Unauthorized");
        require(!bid.isAccepted, "Cannot cancel accepted bid");
        require(!bid.isCompleted, "Bid already completed");

        // Refund the bid amount
        veryToken.safeTransfer(bid.bidder, bid.bidAmount);

        // Mark as completed to prevent further actions
        bid.isCompleted = true;
    }

    /**
     * @dev Get active offers for a specific geohash
     * @param geohash The geohash to filter by
     * @return uint256[] Array of offer IDs
     */
    function getActiveOffersByGeohash(string memory geohash) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // First count matching offers
        for (uint256 i = 0; i < activeOfferIds.length; i++) {
            uint256 offerId = activeOfferIds[i];
            if (offers[offerId].isActive && 
                block.timestamp <= offers[offerId].validUntil &&
                keccak256(bytes(offers[offerId].applicableGeohash)) == keccak256(bytes(geohash))) {
                count++;
            }
        }

        // Create result array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < activeOfferIds.length; i++) {
            uint256 offerId = activeOfferIds[i];
            if (offers[offerId].isActive && 
                block.timestamp <= offers[offerId].validUntil &&
                keccak256(bytes(offers[offerId].applicableGeohash)) == keccak256(bytes(geohash))) {
                result[index] = offerId;
                index++;
            }
        }

        return result;
    }

    /**
     * @dev Get bids for a specific coupon
     * @param couponTokenId The coupon token ID
     * @return uint256[] Array of bid IDs
     */
    function getBidsForCoupon(uint256 couponTokenId) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // First count matching bids
        for (uint256 i = 0; i < activeBidIds.length; i++) {
            uint256 bidId = activeBidIds[i];
            if (bids[bidId].couponTokenId == couponTokenId && !bids[bidId].isCompleted) {
                count++;
            }
        }

        // Create result array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < activeBidIds.length; i++) {
            uint256 bidId = activeBidIds[i];
            if (bids[bidId].couponTokenId == couponTokenId && !bids[bidId].isCompleted) {
                result[index] = bidId;
                index++;
            }
        }

        return result;
    }

    /**
     * @dev Update platform fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function setPlatformFeeRate(uint256 newFeeRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeeRate <= 1000, "Fee rate too high"); // Max 10%
        platformFeeRate = newFeeRate;
    }

    /**
     * @dev Update fee recipient
     * @param newFeeRecipient New fee recipient address
     */
    function setFeeRecipient(address newFeeRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeeRecipient != address(0), "Invalid address");
        feeRecipient = newFeeRecipient;
    }

    /**
     * @dev Pause the contract
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
     * @dev Get merchant count
     */
    function getMerchantCount() external view returns (uint256) {
        return merchantAddresses.length;
    }

    /**
     * @dev Check if address is a registered merchant
     */
    function isMerchant(address addr) external view returns (bool) {
        return merchants[addr].isActive;
    }
}