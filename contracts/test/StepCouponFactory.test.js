const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StepCouponFactory", function () {
  let stepCouponFactory;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const StepCouponFactory = await ethers.getContractFactory("StepCouponFactory");
    stepCouponFactory = await StepCouponFactory.deploy();
    await stepCouponFactory.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const DEFAULT_ADMIN_ROLE = await stepCouponFactory.DEFAULT_ADMIN_ROLE();
      expect(await stepCouponFactory.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
    });

    it("Should have the correct name and symbol", async function () {
      expect(await stepCouponFactory.name()).to.equal("StepCoupon");
      expect(await stepCouponFactory.symbol()).to.equal("STEP");
    });
  });

  describe("Step Verification", function () {
    it("Should verify steps correctly", async function () {
      const VERIFIER_ROLE = await stepCouponFactory.VERIFIER_ROLE();
      await stepCouponFactory.grantRole(VERIFIER_ROLE, owner.address);

      const stepCount = 1500;
      const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_proof"));

      await stepCouponFactory.verifySteps(user1.address, stepCount, proofHash);

      expect(await stepCouponFactory.verifiedSteps(user1.address)).to.equal(stepCount);
    });

    it("Should not allow verification without proper role", async function () {
      const stepCount = 1500;
      const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_proof"));

      await expect(
        stepCouponFactory.connect(user1).verifySteps(user1.address, stepCount, proofHash)
      ).to.be.reverted;
    });
  });

  describe("Coupon Minting", function () {
    beforeEach(async function () {
      const VERIFIER_ROLE = await stepCouponFactory.VERIFIER_ROLE();
      await stepCouponFactory.grantRole(VERIFIER_ROLE, owner.address);

      // Verify enough steps for user1
      const stepCount = 1500;
      const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_proof"));
      await stepCouponFactory.verifySteps(user1.address, stepCount, proofHash);
    });

    it("Should mint coupon with sufficient steps", async function () {
      const geohash = "wydm6";
      
      await expect(stepCouponFactory.connect(user1).mintStepCoupon(geohash))
        .to.emit(stepCouponFactory, "CouponMinted");

      expect(await stepCouponFactory.balanceOf(user1.address)).to.equal(1);
      expect(await stepCouponFactory.verifiedSteps(user1.address)).to.equal(500); // 1500 - 1000
    });

    it("Should not mint coupon with insufficient steps", async function () {
      const geohash = "wydm6";
      
      await expect(
        stepCouponFactory.connect(user2).mintStepCoupon(geohash)
      ).to.be.revertedWith("Insufficient verified steps");
    });

    it("Should store coupon data correctly", async function () {
      const geohash = "wydm6";
      
      await stepCouponFactory.connect(user1).mintStepCoupon(geohash);
      
      const tokenId = 0;
      const coupon = await stepCouponFactory.getCoupon(tokenId);
      
      expect(coupon.stepCount).to.equal(1000);
      expect(coupon.geohash).to.equal(geohash);
      expect(coupon.minter).to.equal(user1.address);
      expect(coupon.isRedeemed).to.equal(false);
    });
  });

  describe("Coupon Validation", function () {
    let tokenId;

    beforeEach(async function () {
      const VERIFIER_ROLE = await stepCouponFactory.VERIFIER_ROLE();
      await stepCouponFactory.grantRole(VERIFIER_ROLE, owner.address);

      // Verify steps and mint coupon
      const stepCount = 1500;
      const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_proof"));
      await stepCouponFactory.verifySteps(user1.address, stepCount, proofHash);
      
      await stepCouponFactory.connect(user1).mintStepCoupon("wydm6");
      tokenId = 0;
    });

    it("Should validate active coupon", async function () {
      expect(await stepCouponFactory.isCouponValid(tokenId)).to.equal(true);
    });

    it("Should redeem coupon correctly", async function () {
      const MINTER_ROLE = await stepCouponFactory.MINTER_ROLE();
      await stepCouponFactory.grantRole(MINTER_ROLE, owner.address);

      await expect(stepCouponFactory.redeemCoupon(tokenId, user2.address))
        .to.emit(stepCouponFactory, "CouponRedeemed");

      expect(await stepCouponFactory.isCouponValid(tokenId)).to.equal(false);
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to pause/unpause", async function () {
      await stepCouponFactory.pause();
      expect(await stepCouponFactory.paused()).to.equal(true);

      await stepCouponFactory.unpause();
      expect(await stepCouponFactory.paused()).to.equal(false);
    });

    it("Should not allow non-admin to pause", async function () {
      await expect(stepCouponFactory.connect(user1).pause()).to.be.reverted;
    });
  });
});