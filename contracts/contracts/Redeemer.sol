// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./StepCouponFactory.sol";
import "./MerchantBidRegistry.sol";

/**
 * @title Redeemer
 * @dev Handles redemption of step coupons and manages fee distribution
 * @notice Merchants can redeem accepted coupons and fees are used to buy AD VERY
 */
contract Redeemer is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant MERCHANT_ROLE = keccak256("MERCHANT_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct Redemption {
        uint256 redemptionId;
        uint256 couponTokenId;
        uint256 bidId;
        address merchant;
        address customer;
        uint256 originalAmount;     // Original purchase amount
        uint256 discountAmount;     // Discount applied
        uint256 finalAmount;        // Final amount paid
        uint256 timestamp;
        string transactionHash;     // Off-chain transaction reference
        bool isVerified;           // Whether redemption is verified
    }

    StepCouponFactory public immutable stepCouponFactory;
    MerchantBidRegistry public immutable merchantBidRegistry;
    IERC20 public immutable veryToken;

    mapping(uint256 => Redemption) public redemptions;
    mapping(address => uint256[]) public merchantRedemptions;
    mapping(address => uint256[]) public customerRedemptions;

    uint256 private _nextRedemptionId = 1;

    // AD VERY contract address for buying ads
    address public adVeryContract;
    
    // Fee collection for AD VERY purchases
    uint256 public collectedFees;
    uint256 public totalAdVeryPurchased;

    // Redemption fee rate (in basis points, e.g., 10 = 0.1%)
    uint256 public redemptionFeeRate = 10;  // 0.1%

    event CouponRedeemed(
        uint256 indexed redemptionId,
        uint256 indexed couponTokenId,
        uint256 indexed bidId,
        address merchant,
        address customer,
        uint256 discountAmount,
        uint256 finalAmount
    );

    event RedemptionVerified(
        uint256 indexed redemptionId,
        address indexed verifier
    );

    event AdVeryPurchased(
        address indexed merchant,
        uint256 amount,
        uint256 timestamp
    );

    event FeeCollected(
        uint256 redemptionId,
        uint256 feeAmount
    );

    constructor(
        address _stepCouponFactory,
        address _merchantBidRegistry,
        address _veryToken,
        address _adVeryContract
    ) {
        require(_stepCouponFactory != address(0), "Invalid StepCouponFactory address");
        require(_merchantBidRegistry != address(0), "Invalid MerchantBidRegistry address");
        require(_veryToken != address(0), "Invalid VERY token address");
        require(_adVeryContract != address(0), "Invalid AD VERY contract address");

        stepCouponFactory = StepCouponFactory(_stepCouponFactory);
        merchantBidRegistry = MerchantBidRegistry(_merchantBidRegistry);
        veryToken = IERC20(_veryToken);
        adVeryContract = _adVeryContract;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Redeem a step coupon
     * @param couponTokenId The step coupon token ID
     * @param bidId The accepted bid ID
     * @param originalAmount The original purchase amount
     * @param transactionHash Off-chain transaction reference
     */
    function redeemCoupon(
        uint256 couponTokenId,
        uint256 bidId,
        uint256 originalAmount,
        string memory transactionHash
    ) external nonReentrant whenNotPaused {
        // Verify the merchant is registered
        require(merchantBidRegistry.isMerchant(msg.sender), "Not a registered merchant");

        // Get bid details
        (,, uint256 bidCouponTokenId, address bidder, address couponOwner, uint256 bidAmount,, bool isAccepted, bool isCompleted) = 
            merchantBidRegistry.bids(bidId);

        require(bidder == msg.sender, "Not your bid");
        require(bidCouponTokenId == couponTokenId, "Bid doesn't match coupon");
        require(isAccepted, "Bid not accepted");
        require(!isCompleted, "Bid already completed");

        // Verify coupon is valid
        require(stepCouponFactory.isCouponValid(couponTokenId), "Invalid coupon");

        // Get offer details to calculate discount
        (uint256 offerId,,,, uint256 discountPercentage, uint256 maxDiscountAmount, uint256 minPurchaseAmount,,,,) = 
            merchantBidRegistry.offers(bidId);

        require(originalAmount >= minPurchaseAmount, "Purchase amount too low");

        // Calculate discount
        uint256 discountAmount = (originalAmount * discountPercentage) / 100;
        if (discountAmount > maxDiscountAmount) {
            discountAmount = maxDiscountAmount;
        }

        uint256 finalAmount = originalAmount - discountAmount;
        
        // Calculate redemption fee
        uint256 feeAmount = (discountAmount * redemptionFeeRate) / 10000;
        collectedFees += feeAmount;

        // Create redemption record
        uint256 redemptionId = _nextRedemptionId++;
        
        redemptions[redemptionId] = Redemption({
            redemptionId: redemptionId,
            couponTokenId: couponTokenId,
            bidId: bidId,
            merchant: msg.sender,
            customer: couponOwner,
            originalAmount: originalAmount,
            discountAmount: discountAmount,
            finalAmount: finalAmount,
            timestamp: block.timestamp,
            transactionHash: transactionHash,
            isVerified: false
        });

        merchantRedemptions[msg.sender].push(redemptionId);
        customerRedemptions[couponOwner].push(redemptionId);

        // Mark coupon as redeemed (this will burn the NFT)
        stepCouponFactory.redeemCoupon(couponTokenId, msg.sender);

        // Complete the bid
        merchantBidRegistry.completeBid(bidId);

        emit CouponRedeemed(
            redemptionId,
            couponTokenId,
            bidId,
            msg.sender,
            couponOwner,
            discountAmount,
            finalAmount
        );

        emit FeeCollected(redemptionId, feeAmount);
    }

    /**
     * @dev Verify a redemption (for compliance and fraud prevention)
     * @param redemptionId The redemption ID to verify
     */
    function verifyRedemption(uint256 redemptionId) external onlyRole(VERIFIER_ROLE) {
        require(redemptions[redemptionId].redemptionId != 0, "Redemption does not exist");
        require(!redemptions[redemptionId].isVerified, "Already verified");

        redemptions[redemptionId].isVerified = true;

        emit RedemptionVerified(redemptionId, msg.sender);
    }

    /**
     * @dev Purchase AD VERY for a merchant using collected fees
     * @param merchant The merchant to purchase AD VERY for
     * @param amount The amount of VERY tokens to spend on ads
     */
    function purchaseAdVery(address merchant, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(merchantBidRegistry.isMerchant(merchant), "Not a registered merchant");
        require(amount > 0, "Amount must be positive");
        require(amount <= collectedFees, "Insufficient collected fees");

        collectedFees -= amount;
        totalAdVeryPurchased += amount;

        // Transfer VERY tokens to AD VERY contract
        veryToken.safeTransfer(adVeryContract, amount);

        emit AdVeryPurchased(merchant, amount, block.timestamp);
    }

    /**
     * @dev Batch purchase AD VERY for multiple merchants
     * @param merchants Array of merchant addresses
     * @param amounts Array of amounts for each merchant
     */
    function batchPurchaseAdVery(
        address[] memory merchants,
        uint256[] memory amounts
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(merchants.length == amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalAmount <= collectedFees, "Insufficient collected fees");

        collectedFees -= totalAmount;
        totalAdVeryPurchased += totalAmount;

        for (uint256 i = 0; i < merchants.length; i++) {
            require(merchantBidRegistry.isMerchant(merchants[i]), "Invalid merchant");
            emit AdVeryPurchased(merchants[i], amounts[i], block.timestamp);
        }

        // Transfer total amount to AD VERY contract
        veryToken.safeTransfer(adVeryContract, totalAmount);
    }

    /**
     * @dev Get redemption history for a merchant
     * @param merchant The merchant address
     * @return uint256[] Array of redemption IDs
     */
    function getMerchantRedemptions(address merchant) external view returns (uint256[] memory) {
        return merchantRedemptions[merchant];
    }

    /**
     * @dev Get redemption history for a customer
     * @param customer The customer address
     * @return uint256[] Array of redemption IDs
     */
    function getCustomerRedemptions(address customer) external view returns (uint256[] memory) {
        return customerRedemptions[customer];
    }

    /**
     * @dev Get redemption details
     * @param redemptionId The redemption ID
     * @return Redemption memory The redemption data
     */
    function getRedemption(uint256 redemptionId) external view returns (Redemption memory) {
        require(redemptions[redemptionId].redemptionId != 0, "Redemption does not exist");
        return redemptions[redemptionId];
    }

    /**
     * @dev Calculate potential discount for a purchase
     * @param bidId The bid ID
     * @param purchaseAmount The purchase amount
     * @return uint256 The discount amount
     */
    function calculateDiscount(uint256 bidId, uint256 purchaseAmount) external view returns (uint256) {
        (uint256 offerId,,,,,, uint256 minPurchaseAmount,,,) = merchantBidRegistry.offers(bidId);
        
        if (purchaseAmount < minPurchaseAmount) {
            return 0;
        }

        (,, uint256 discountPercentage, uint256 maxDiscountAmount,,,,,,,) = 
            merchantBidRegistry.offers(offerId);

        uint256 discountAmount = (purchaseAmount * discountPercentage) / 100;
        if (discountAmount > maxDiscountAmount) {
            discountAmount = maxDiscountAmount;
        }

        return discountAmount;
    }

    /**
     * @dev Set redemption fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function setRedemptionFeeRate(uint256 newFeeRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeeRate <= 1000, "Fee rate too high"); // Max 10%
        redemptionFeeRate = newFeeRate;
    }

    /**
     * @dev Update AD VERY contract address
     * @param newAdVeryContract New AD VERY contract address
     */
    function setAdVeryContract(address newAdVeryContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAdVeryContract != address(0), "Invalid address");
        adVeryContract = newAdVeryContract;
    }

    /**
     * @dev Emergency withdrawal of collected fees
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to != address(0), "Invalid address");
        require(amount <= collectedFees, "Insufficient balance");
        
        collectedFees -= amount;
        veryToken.safeTransfer(to, amount);
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
     * @dev Get contract statistics
     * @return totalRedemptions Total number of redemptions
     * @return totalFeesCollected Total fees collected
     * @return totalAdVeryPurchased Total AD VERY purchased
     */
    function getContractStats() external view returns (
        uint256 totalRedemptions,
        uint256 totalFeesCollected,
        uint256 totalAdVeryPurchasedAmount
    ) {
        return (_nextRedemptionId - 1, collectedFees, totalAdVeryPurchased);
    }
}