"use client";
import { Contract } from "ethers";
import useSWR from "swr";

const useDataSet = (contract: Contract | null) => {
  // to fetch donorAddresses[] and recipientAddresses[]
  const { data: combinedData, isLoading: dataIsLoading } = useSWR(
    () => (contract ? "web3/addresses/status" : null),

    async () => {
      const donorAddress = await contract?.getDonorAddresses();
      const recipientAddress = await contract?.getRecipientAddresses();

      const donorsStatus = await statusArr(donorAddress, "getDonorState");
      const recipientsStatus = await statusArr(
        recipientAddress,
        "getRecipientState"
      );

      return {
        addresses: { donorAddress, recipientAddress },
        status: {
          donorsStatus,
          recipientsStatus,
        },
      };
    }
  );

  // helper function to fetch donorStatus[] and recipientStatus[]
  const statusArr = async (addresses: string[], method: string) => {
    try {
      if (contract && method in contract) {
        const stateMapping = addresses?.map(async (address: string) => {
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
        return data;
      } else {
        console.log(
          "The contract or methodName does not exist in the contract"
        );
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const { donorAddress, recipientAddress } = combinedData?.addresses || {};
  const { donorsStatus, recipientsStatus } = combinedData?.status || {};

  return {
    donorAddress: donorAddress,
    recipientAddress: recipientAddress,
    donorsStatus: donorsStatus,
    recipientsStatus: recipientsStatus,
    dataIsLoading,
  };
};
export default useDataSet;
