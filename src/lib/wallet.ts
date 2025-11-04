import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect, metaMask } from 'wagmi/connectors';

// Sonic blockchain configuration
// Sonic is EVM-compatible, so we can use standard Ethereum tooling
// Update these RPC URLs with actual Sonic mainnet/testnet endpoints
const sonicMainnet = {
  id: 146,
  name: 'Sonic Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.soniclabs.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SonicScan',
      url: 'https://sonicscan.org',
    },
  },
} as const;

const sonicTestnet = {
  id: 64165,
  name: 'Sonic Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.soniclabs.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SonicScan Testnet',
      url: 'https://testnet.sonicscan.org',
    },
  },
} as const;

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Build connectors array - WalletConnect is optional
const connectors = [
  injected(),
  metaMask(),
];

// Only add WalletConnect if projectId is provided
// Note: walletConnect connector is deprecated but still functional
// Consider migrating to @reown/wagmi-connector in the future
if (projectId) {
  connectors.push(
    walletConnect({
      projectId,
      showQrModal: true,
    }) as typeof connectors[0]
  );
}

export const wagmiConfig = createConfig({
  chains: [sonicTestnet, sonicMainnet], // Use testnet by default for development
  connectors,
  transports: {
    [sonicTestnet.id]: http(),
    [sonicMainnet.id]: http(),
  },
});

