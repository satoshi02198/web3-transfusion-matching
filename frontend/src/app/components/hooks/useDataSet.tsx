"use client";
import { Contract } from "ethers";
import useSWR from "swr";
import { retry } from "../../../../utils/retry";

const useDataSet = (contract: Contract | null) => {
  // to fetch donorAddresses[] and recipientAddresses[]
  const { data: combinedData, isLoading: dataIsLoading } = useSWR(
    () => (contract ? "web3/addresses/status" : null),

    async () => {
      const donorAddress = await retry(
        () => contract?.getDonorAddresses(),
        10,
        64000,
        "getDonorAddressesWithRetry"
      );
      const recipientAddress = await retry(
        () => contract?.getRecipientAddresses(),
        10,
        64000,
        "getDonorAddressesWithRetry"
      );
      const donorsStatus = await getStatusArrWithRetries(
        donorAddress,
        "getDonorState"
      );
      const recipientsStatus = await getStatusArrWithRetries(
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
  const getStatusArr = async (addresses: string[], method: string) => {
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
      console.log("catching error in getStatusArr in useDataSet");
      console.log(error.message);
      throw new Error(error.message);
    }
  };
  // GET STATUS ARRAY WITH RETRY retry() is located in utils/retry.tsx
  const getStatusArrWithRetries = async (
    addresses: string[],
    method: string
  ) => {
    const maxRetries = 10;
    const maxBackoff = 64000;
    return await retry(
      () => getStatusArr(addresses, method),
      maxRetries,
      maxBackoff,
      method + " of getStatusArr"
    );
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
