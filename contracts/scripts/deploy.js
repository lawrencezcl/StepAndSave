const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Step-and-Save contracts deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const deployedContracts = {};

  try {
    // Deploy StepCouponFactory
    console.log("\n📝 Deploying StepCouponFactory...");
    const StepCouponFactory = await ethers.getContractFactory("StepCouponFactory");
    const stepCouponFactory = await StepCouponFactory.deploy();
    await stepCouponFactory.deployed();
    
    deployedContracts.StepCouponFactory = {
      address: stepCouponFactory.address,
      constructorArgs: []
    };
    console.log("✅ StepCouponFactory deployed to:", stepCouponFactory.address);

    // For demo purposes, we'll use a mock VERY token address
    // In production, this should be the actual VERY token contract address
    const VERY_TOKEN_ADDRESS = process.env.VERY_TOKEN_ADDRESS || "0x1234567890123456789012345678901234567890";
    const FEE_RECIPIENT = process.env.FEE_RECIPIENT || deployer.address;

    // Deploy MerchantBidRegistry
    console.log("\n🏪 Deploying MerchantBidRegistry...");
    const MerchantBidRegistry = await ethers.getContractFactory("MerchantBidRegistry");
    const merchantBidRegistry = await MerchantBidRegistry.deploy(
      VERY_TOKEN_ADDRESS,
      FEE_RECIPIENT
    );
    await merchantBidRegistry.deployed();
    
    deployedContracts.MerchantBidRegistry = {
      address: merchantBidRegistry.address,
      constructorArgs: [VERY_TOKEN_ADDRESS, FEE_RECIPIENT]
    };
    console.log("✅ MerchantBidRegistry deployed to:", merchantBidRegistry.address);

    // For demo purposes, we'll use a mock AD VERY contract address
    const AD_VERY_CONTRACT = process.env.AD_VERY_CONTRACT || deployer.address;

    // Deploy Redeemer
    console.log("\n🎫 Deploying Redeemer...");
    const Redeemer = await ethers.getContractFactory("Redeemer");
    const redeemer = await Redeemer.deploy(
      stepCouponFactory.address,
      merchantBidRegistry.address,
      VERY_TOKEN_ADDRESS,
      AD_VERY_CONTRACT
    );
    await redeemer.deployed();
    
    deployedContracts.Redeemer = {
      address: redeemer.address,
      constructorArgs: [
        stepCouponFactory.address,
        merchantBidRegistry.address,
        VERY_TOKEN_ADDRESS,
        AD_VERY_CONTRACT
      ]
    };
    console.log("✅ Redeemer deployed to:", redeemer.address);

    // Setup roles and permissions
    console.log("\n🔐 Setting up roles and permissions...");
    
    // Grant MINTER_ROLE to Redeemer contract for StepCouponFactory
    const MINTER_ROLE = await stepCouponFactory.MINTER_ROLE();
    await stepCouponFactory.grantRole(MINTER_ROLE, redeemer.address);
    console.log("✅ Granted MINTER_ROLE to Redeemer");

    // Grant MANAGER_ROLE to Redeemer contract for MerchantBidRegistry
    const MANAGER_ROLE = await merchantBidRegistry.MANAGER_ROLE();
    await merchantBidRegistry.grantRole(MANAGER_ROLE, redeemer.address);
    console.log("✅ Granted MANAGER_ROLE to Redeemer");

    // Save deployment information
    const deploymentInfo = {
      network: hre.network.name,
      chainId: (await ethers.provider.getNetwork()).chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      transactions: {
        stepCouponFactory: stepCouponFactory.deployTransaction.hash,
        merchantBidRegistry: merchantBidRegistry.deployTransaction.hash,
        redeemer: redeemer.deployTransaction.hash
      }
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info to file
    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 Deployment completed successfully!");
    console.log("📄 Deployment info saved to:", deploymentFile);
    
    console.log("\n📋 Contract Addresses:");
    console.log("StepCouponFactory:", stepCouponFactory.address);
    console.log("MerchantBidRegistry:", merchantBidRegistry.address);
    console.log("Redeemer:", redeemer.address);
    
    console.log("\n🔗 Next steps:");
    console.log("1. Verify contracts on block explorer");
    console.log("2. Update frontend configuration with contract addresses");
    console.log("3. Configure backend services with contract ABIs");
    console.log("4. Test the complete flow with sample data");

    // If on a testnet, create some sample data
    if (hre.network.name.includes("testnet") || hre.network.name === "hardhat") {
      console.log("\n🧪 Creating sample test data...");
      await createSampleData(stepCouponFactory, merchantBidRegistry, deployer);
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

async function createSampleData(stepCouponFactory, merchantBidRegistry, deployer) {
  try {
    // Register a sample merchant
    console.log("📝 Registering sample merchant...");
    await merchantBidRegistry.registerMerchant(
      "ABC Cafe",
      "Cozy coffee shop in Gangnam",
      "123 Gangnam-daero, Seoul",
      "wydm6"  // Gangnam area geohash
    );
    console.log("✅ Sample merchant registered");

    // Create a sample offer
    console.log("📝 Creating sample offer...");
    const validityDuration = 30 * 24 * 60 * 60; // 30 days
    await merchantBidRegistry.createOffer(
      "20% Off Coffee",
      "Get 20% discount on all coffee drinks",
      20, // 20% discount
      ethers.utils.parseEther("10"), // Max 10 VERY discount
      ethers.utils.parseEther("5"),  // Min 5 VERY purchase
      "wydm6", // Gangnam area
      validityDuration,
      100 // Max 100 redemptions
    );
    console.log("✅ Sample offer created");

    console.log("🎉 Sample data created successfully!");
    
  } catch (error) {
    console.warn("⚠️ Failed to create sample data:", error.message);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });