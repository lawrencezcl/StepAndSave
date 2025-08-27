import { ethers } from 'ethers';
import { createWalletClient, createPublicClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { z } from 'zod';

// VERY Network configuration
const VERY_NETWORK = {
  id: 12052024,
  name: 'VERY Network',
  network: 'very',
  nativeCurrency: {
    decimals: 18,
    name: 'VERY',
    symbol: 'VERY',
  },
  rpcUrls: {
    default: {
      http: [process.env.VERY_RPC_URL || 'https://testnet-rpc.very.network'],
    },
    public: {
      http: [process.env.VERY_RPC_URL || 'https://testnet-rpc.very.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'VERY Explorer',
      url: 'https://testnet-explorer.very.network',
    },
  },
} as const;

// Transaction validation schema
const MetaTransactionSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  data: z.string().regex(/^0x[a-fA-F0-9]*$/),
  value: z.string().optional().default('0'),
  gasLimit: z.string().optional(),
  nonce: z.number().optional(),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/),
  from: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export interface MetaTransaction {
  to: string;
  data: string;
  value?: string;
  gasLimit?: string;
  nonce?: number;
  signature: string;
  from: string;
}

export interface RelayResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: string;
  blockNumber?: number;
}

export class RelayerService {
  private walletClient: any;
  private publicClient: any;
  private account: any;
  private isInitialized = false;

  constructor() {
    // Initialize clients
    this.initialize();
  }

  async initialize(): Promise<void> {
    try {
      if (!process.env.RELAYER_PRIVATE_KEY) {
        throw new Error('RELAYER_PRIVATE_KEY environment variable is required');
      }

      // Create account from private key
      this.account = privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY as `0x${string}`);

      // Create wallet client
      this.walletClient = createWalletClient({
        account: this.account,
        chain: VERY_NETWORK,
        transport: http(),
      });

      // Create public client
      this.publicClient = createPublicClient({
        chain: VERY_NETWORK,
        transport: http(),
      });

      // Check relayer balance
      const balance = await this.publicClient.getBalance({
        address: this.account.address,
      });

      const balanceInVery = Number(balance) / 1e18;
      console.log(`💰 Relayer balance: ${balanceInVery.toFixed(4)} VERY`);

      if (balanceInVery < 0.1) {
        console.warn('⚠️ Low relayer balance! Please top up the relayer wallet.');
      }

      this.isInitialized = true;
      console.log('✅ RelayerService initialized successfully');
      console.log(`📍 Relayer address: ${this.account.address}`);

    } catch (error) {
      console.error('❌ Failed to initialize RelayerService:', error);
      throw error;
    }
  }

  async relayTransaction(metaTx: MetaTransaction): Promise<RelayResult> {
    if (!this.isInitialized) {
      throw new Error('RelayerService not initialized');
    }

    try {
      // Validate input
      const validatedTx = MetaTransactionSchema.parse(metaTx);

      // Verify signature
      const isValidSignature = await this.verifySignature(validatedTx);
      if (!isValidSignature) {
        return {
          success: false,
          error: 'Invalid signature',
        };
      }

      // Check if user has sufficient balance for any required payments
      const userBalance = await this.publicClient.getBalance({
        address: validatedTx.from,
      });

      console.log(`🔄 Relaying transaction for ${validatedTx.from}`);
      console.log(`📊 User balance: ${Number(userBalance) / 1e18} VERY`);

      // Estimate gas
      const gasEstimate = await this.publicClient.estimateGas({
        account: this.account.address,
        to: validatedTx.to as `0x${string}`,
        data: validatedTx.data as `0x${string}`,
        value: parseEther(validatedTx.value || '0'),
      });

      // Add 20% buffer to gas estimate
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

      // Send transaction
      const hash = await this.walletClient.sendTransaction({
        account: this.account.address,
        to: validatedTx.to as `0x${string}`,
        data: validatedTx.data as `0x${string}`,
        value: parseEther(validatedTx.value || '0'),
        gas: gasLimit,
      });

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
        timeout: 30000, // 30 seconds
      });

      console.log(`✅ Transaction relayed successfully: ${hash}`);

      return {
        success: true,
        transactionHash: hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: Number(receipt.blockNumber),
      };

    } catch (error) {
      console.error('❌ Failed to relay transaction:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async verifySignature(metaTx: MetaTransaction): Promise<boolean> {
    try {
      // Create message hash for EIP-712 signing
      const domain = {
        name: 'Step-and-Save',
        version: '1',
        chainId: VERY_NETWORK.id,
        verifyingContract: metaTx.to,
      };

      const types = {
        MetaTransaction: [
          { name: 'to', type: 'address' },
          { name: 'data', type: 'bytes' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
        ],
      };

      const message = {
        to: metaTx.to,
        data: metaTx.data,
        value: metaTx.value || '0',
        nonce: metaTx.nonce || 0,
      };

      // Use ethers for signature verification
      const provider = new ethers.JsonRpcProvider(VERY_NETWORK.rpcUrls.default.http[0]);
      const messageHash = ethers.TypedDataEncoder.hash(domain, types, message);
      const recoveredAddress = ethers.verifyMessage(
        ethers.getBytes(messageHash),
        metaTx.signature
      );

      return recoveredAddress.toLowerCase() === metaTx.from.toLowerCase();

    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  async getRelayerBalance(): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('RelayerService not initialized');
    }

    const balance = await this.publicClient.getBalance({
      address: this.account.address,
    });

    return (Number(balance) / 1e18).toFixed(4);
  }

  async getTransactionStatus(hash: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('RelayerService not initialized');
    }

    try {
      const receipt = await this.publicClient.getTransactionReceipt({
        hash: hash as `0x${string}`,
      });

      return {
        status: receipt.status === 'success' ? 'confirmed' : 'failed',
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed.toString(),
        logs: receipt.logs,
      };
    } catch (error) {
      // Transaction not found or pending
      return {
        status: 'pending',
      };
    }
  }

  async estimateRelayFee(metaTx: Omit<MetaTransaction, 'signature' | 'from'>): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('RelayerService not initialized');
    }

    try {
      const gasEstimate = await this.publicClient.estimateGas({
        account: this.account.address,
        to: metaTx.to as `0x${string}`,
        data: metaTx.data as `0x${string}`,
        value: parseEther(metaTx.value || '0'),
      });

      const gasPrice = await this.publicClient.getGasPrice();
      const estimatedFee = gasEstimate * gasPrice;

      return (Number(estimatedFee) / 1e18).toFixed(6);
    } catch (error) {
      console.error('Failed to estimate relay fee:', error);
      throw error;
    }
  }

  getRelayerAddress(): string {
    if (!this.isInitialized) {
      throw new Error('RelayerService not initialized');
    }
    return this.account.address;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}