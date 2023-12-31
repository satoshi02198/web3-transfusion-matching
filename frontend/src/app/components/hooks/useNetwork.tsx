import { BytesLike, ethers, id, toUtf8Bytes, toUtf8String } from "ethers";
import useSWR from "swr";

// HELPER FUNCTION TO CONVERT NUMBER TO UNPADDED HEX
const toUnpaddedHex = (number: number) => {
  const unpaddedHex = number.toString(16);
  const prefixedHex = "0x" + unpaddedHex;
  return prefixedHex;
};

// NETWORKS INFORMATION
const NETWORKS = {
  1: {
    name: "Ethereum Mainnet",
    chainId: toUnpaddedHex(1),
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    logo: "/ethereum.svg",
    rpcUrls: ["https://eth.llamarpc.com"],
    blockExplorerUrls: ["https://etherscan.io/"],
  },
  5: {
    name: "Goerli Testnet",
    chainId: toUnpaddedHex(5),
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    logo: "/ethereum.svg",
    rpcUrls: ["https://rpc.ankr.com/eth_goerli"],
    blockExplorerUrls: ["https://goerli.etherscan.io/"],
  },
  31337: {
    name: "Hardhat Testnet",
    chainId: toUnpaddedHex(31337),
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    logo: "/hardhat.svg",
    rpcUrls: ["http://127.0.0.1:8545/"],
    blockExplorerUrls: [""],
  },
  11155111: {
    name: "Sepolia Testnet",
    chainId: toUnpaddedHex(11155111),
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    logo: "/ethereum.svg",
    rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/demo"],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
  },
  // 56: "Binance Smart Chain",
};

const targetNetworkId = process.env.NEXT_PUBLIC_TARGET_CHAIN_ID;
const targetNetwork =
  NETWORKS[
    Number(process.env.NEXT_PUBLIC_TARGET_CHAIN_ID) as keyof typeof NETWORKS
  ];

console.log("🚀 ~ targetNetwork:", targetNetwork);

// HOOK
const useNetwork = (provider: ethers.BrowserProvider | null) => {
  const { data, error } = useSWR(
    () => (provider ? "web3/network" : null),
    async () => {
      const network = await provider?.getNetwork();
      const chainId = Number(network?.chainId as bigint);

      if (!chainId) {
        throw new Error("Network not found");
      }
      const networkName = NETWORKS[chainId as keyof typeof NETWORKS];
      return {
        networkName,
        chainId,
      };
    }
  );

  // TO SWITCH TO TARGET NETWORK
  const switchToTargetNetwork = async () => {
    try {
      await provider?.send("wallet_switchEthereumChain", [
        {
          chainId: targetNetwork.chainId,
        },
      ]);
    } catch (switchError: any) {
      console.error(switchError.message);
      // in case, user didn't add the target network
      if (switchError.error.code === 4902) {
        try {
          console.log("switching to main network");
          await provider?.send("wallet_addEthereumChain", [
            {
              chainId: targetNetwork.chainId,
              chainName: targetNetwork.name,
              nativeCurrency: targetNetwork.nativeCurrency,
              rpcUrls: targetNetwork.rpcUrls,
              blockExplorerUrls: targetNetwork.blockExplorerUrls,
            },
          ]);
        } catch (addError: any) {
          console.error(addError.message);
          console.log("Adding target network failed");
        }
      }
    }
  };

  return {
    currentNetwork: data?.networkName,
    chainId: data?.chainId,
    error,
    isLoaded: data || error,
    targetNetwork,
    targetNetworkId: targetNetworkId,
    switchToTargetNetwork,
  };
};
export default useNetwork;
