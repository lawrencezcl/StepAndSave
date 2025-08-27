import { createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet, sepolia } from 'wagmi/chains';

// Very Network testnet configuration
export const veryTestnet = {
  id: 12052024,
  name: 'VERY Testnet',
  network: 'very-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'VERY',
    symbol: 'VERY',
  },
  rpcUrls: {
    public: { http: ['https://rpc-testnet.very.network'] },
    default: { http: ['https://rpc-testnet.very.network'] },
  },
  blockExplorers: {
    default: { name: 'Very Explorer', url: 'https://testnet.veryscan.io' },
  },
  testnet: true,
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [veryTestnet, sepolia, mainnet],
  [publicProvider()]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

export { veryTestnet as defaultChain, chains };