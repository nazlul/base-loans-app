import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains'; 
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { rabbyWallet,metaMaskWallet, rainbowWallet  } from '@rainbow-me/rainbowkit/wallets';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string; 

const connectors = connectorsForWallets([
  {
    groupName: 'Suggested',
    wallets: [
      rabbyWallet,  
      metaMaskWallet,
      rainbowWallet,
    ],
  },
], { appName: 'Presale App', projectId: projectId });

export const config = createConfig({
  transports: { 
    [base.id]: http(), 
  },
  connectors,
  chains: [base],
  ssr: true,
});


 