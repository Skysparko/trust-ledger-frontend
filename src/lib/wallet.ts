import { createConfig, http } from 'wagmi';
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

// Only initialize wallet config on client-side to avoid SSR issues
const getWagmiConfig = () => {
  // Guard against server-side execution
  if (typeof window === 'undefined') {
    // Return a minimal config for SSR (will be replaced on client)
    return createConfig({
      chains: [sonicTestnet, sonicMainnet],
      connectors: [],
      transports: {
        [sonicTestnet.id]: http(),
        [sonicMainnet.id]: http(),
      },
    });
  }

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

  // Build connectors array - WalletConnect is optional
  // Only create connectors on client-side where window is available
  const connectors = [];
  
  try {
    // Try to create injected connector (MetaMask, etc.)
    connectors.push(injected());
    // MetaMask connector is also added via injected(), but we can add it explicitly if needed
    // Note: metaMask() might be redundant if injected() already handles it
  } catch (error) {
    console.warn('[Wallet] Failed to initialize injected connector:', error);
  }

  // Only add WalletConnect if projectId is provided
  // Note: walletConnect connector is deprecated but still functional
  // Consider migrating to @reown/wagmi-connector in the future
  if (projectId) {
    try {
      connectors.push(
        walletConnect({
          projectId,
          showQrModal: true,
        }) as typeof connectors[0]
      );
    } catch (error) {
      console.warn('[Wallet] Failed to initialize WalletConnect connector:', error);
    }
  }

  return createConfig({
    chains: [sonicTestnet, sonicMainnet], // Use testnet by default for development
    connectors,
    transports: {
      [sonicTestnet.id]: http(),
      [sonicMainnet.id]: http(),
    },
  });
};

// Export the function instead of the config to allow lazy initialization
export const getWagmiConfigInstance = getWagmiConfig;

// For backward compatibility, also export a default config
// But it's better to use getWagmiConfigInstance() in client components
export const wagmiConfig = getWagmiConfig();

