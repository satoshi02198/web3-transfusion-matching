import React, { useEffect, useState } from "react";
import { useWeb3 } from "../providers/Provider";
import { ethers } from "ethers";

type useDataType = {
  donorAddress: never[];
  recipientAddress: never[];
  donorState: number | null;
  recipientState: number | null;
  donorsStatus: number[];
  recipientsStatus: number[];
  getOverview: (contract: ethers.Contract | null) => Promise<null | undefined>;
  checkStatus: (address: string | undefined) => Promise<void>;
};

const useData = (): useDataType => {
  const { contract, address } = useWeb3();
  // addresses[]
  const [donorAddress, setDonorAddress] = useState([]);
  const [recipientAddress, setRecipientAddress] = useState([]);

  // individual status
  const [donorState, setDonorState] = useState<number | null>(null);
  const [recipientState, setRecipientState] = useState<number | null>(null);

  // to count states of donor and recipient
  const [donorsStatus, setDonorsStatus] = useState<number[]>([]);
  const [recipientsStatus, setRecipientsStatus] = useState<number[]>([]);

  // set Addresses[] first then set Status[] to states number
  useEffect(() => {
    if (!contract) return;
    const getData = async () => {
      await getOverview(contract);
    };
    getData();
    setDonorState(null);
    setRecipientState(null);
  }, [contract, address]);

  // to status of both donors and recipients
  useEffect(() => {
    statusArr(donorAddress, "getDonorState");
    statusArr(recipientAddress, "getRecipientState");
  }, [donorAddress, recipientAddress]);

  // to get donorAddresses[] and recipientAddresses[]
  const getOverview = async (contract: ethers.Contract | null) => {
    try {
      const donorAddress = await contract?.getDonorAddresses();

      if (donorAddress.length > 0) {
        setDonorAddress(donorAddress);
      } else {
        return null;
      }
      const recipientAddress = await contract?.getRecipientAddresses();
      if (recipientAddress.length > 0) {
        setRecipientAddress(recipientAddress);
      } else {
        return null;
      }
    } catch (error: any) {
      console.log(error.message);
    } finally {
    }
  };

  // for individual to check status
  const checkStatus = async (address: string | undefined) => {
    try {
      setDonorState(null);
      setRecipientState(null);
      const tx = await contract?.getDonorState(address);
      if (tx) {
        console.log("🚀 ~ checkStatus ~ As Donor:", tx);
        setDonorState(Number(tx));
      } else {
        setDonorState(4);
      }
      const tx2 = await contract?.getRecipientState(address);
      if (tx2) {
        console.log("🚀 ~ checkStatus ~ As Recipient:", tx2);
        setRecipientState(Number(tx2));
      } else {
        setRecipientState(4);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  // to count status of both donors and recipients
  // depends on args two contract functions are called
  const statusArr = async (addresses: string[], method: string) => {
    try {
      if (contract && method in contract) {
        const stateMapping = addresses.map(async (address: string) => {
          const stateArr = await contract[method](address);
          if (stateArr) {
            return Number(stateArr);
          }
        });

        const data = (await Promise.all(stateMapping)).filter(
          (state): state is number => state !== undefined
        );
        if (!data) return;
        // object to map method to state-setting
        const setters = {
          getDonorState: setDonorsStatus,
          getRecipientState: setRecipientsStatus,
        };
        const setter = setters[method as "getDonorState" | "getRecipientState"];
        if (setter) {
          setter(data);
        }
      } else {
        console.log(
          "The contract or methodName does not exist in the contract"
        );
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return {
    donorAddress,
    recipientAddress,
    donorState,
    recipientState,
    donorsStatus,
    recipientsStatus,
    getOverview,
    checkStatus,
  };
};
export default useData;
