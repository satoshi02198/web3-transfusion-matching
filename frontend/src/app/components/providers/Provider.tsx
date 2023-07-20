"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { ethers } from "ethers";
import contractAddress from "../../contracts/contract-address-localhost.json";
import transfusionArtifact from "../../contracts/Transfusion.json";

type ProviderProps = {
  children: React.ReactNode;
};

type Web3ContextType = {
  contract: ethers.Contract | null;
  provider: ethers.BrowserProvider | null;
  address: string | undefined;
  contractIsLoading: boolean;
  requireInstall: boolean;
  isAdmin: boolean;
  connectWallet: () => Promise<void>;
};

const Web3Context = createContext<Web3ContextType | null>(null);

const Web3Provider: React.FC<ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | undefined>(
    undefined
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const initContract = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          if (provider) {
            const contract = new ethers.Contract(
              contractAddress.Transfusion,
              transfusionArtifact.abi,
              signer ? signer : provider
            );
            setContract(contract);
          } else {
            setContract(null);
            console.log("can't get signer");
          }
        } else {
          setContract(null);

          console.log("no web3 provider detected");
        }
      } finally {
        setIsLoading(false);
      }
    };
    initContract();
  }, [signer]);

  useEffect(() => {
    if (!contract || !address) return;
    const checkAdmin = async () => {
      try {
        const data = await contract.checkAdmins(address);
        setIsAdmin(data);
      } catch (error: any) {
        console.log(error.message);
      }
    };
    checkAdmin();
  }, [contract]);

  // helper function for connectWallet
  const getSigner = async () => {
    const signer = await provider?.getSigner();
    const address = await signer?.getAddress();

    if (!signer || !address) {
      throw new Error("can't get signer or address.");
    }
    setAddress(address);
    setSigner(signer);
  };

  const connectWallet = async () => {
    if (!provider) alert("Please install MetaMask");
    await getSigner();

    window.ethereum.on("chainChanged", async (chainId: number) => {
      window.location.reload();
    });
    window.ethereum.on("accountsChanged", async (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(undefined);
        setSigner(undefined);
        return;
      }

      await getSigner();
    });
  };

  const _web3 = useMemo(() => {
    return {
      contract: contract,
      provider: provider,
      address: address,
      contractIsLoading: isLoading,
      requireInstall: !isLoading && !contract,
      isAdmin: isAdmin,
      connectWallet: connectWallet,
    };
  }, [contract, address, isLoading, isAdmin, provider]);

  return (
    <Web3Context.Provider value={_web3 ? _web3 : null}>
      {children}
    </Web3Context.Provider>
  );
};
export default Web3Provider;

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("somehow I can't get a web3 provider");
  }
  return context;
};
