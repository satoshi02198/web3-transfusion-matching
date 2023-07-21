"use client";

import { Contract, ethers } from "ethers";
import useSWR from "swr";
import { getEvents, getTimestamp } from "../../../../utils/event";
import useDataSet from "./useDataSet";
import { retry } from "../../../../utils/retry";

export type AllDonorInfo = {
  id: number;
  donorAddress: string;
  name: string;
  bloodType: string;
  state: string;
  time: string;
};
export type AllRecipientInfo = {
  id: number;
  recipientAddress: string;
  name: string;
  bloodType: string;
  state: string;
  time: string;
};

type MatchedEventsInfo = {
  donorAddress: string;
  recipientAddress: string;
  bloodType: string;
  time: string;
};

type MethodType = "getDonor" | "getRecipient";

const Blood_TYPE_HASH: Record<string, string> = {
  "0xbc8ad4fa23449205da10b2a086888a16aae2ac121f166bdaf18384f01c5a1923": "A+",
  "0xdf7476d61b1a156721ba27e1ab032065608e5f4078e0256dca5b79eefc992b6c": "A-",
  "0x5c824a22c75ee3364219136d475a54e97a9ddcf1807f4545222958ac4dbabbbc": "B+",
  "0x07c94aa4a0093c1bd658802a46e7cdc3eb138050c59571a1dc1cee71a38bbdbd": "B-",
  "0x039622a8de431d550cd225238681ea4fc4c3027c40ae1a6c418d871345bb2775": "AB+",
  "0x1f965545eee3e7c5e0219887bd1886412154930061dfb66d444e3ab5d5e25f91": "AB-",
  "0xc669aa98d5975cc43653c879a18d9bc4aa8bf51e69f61aeb1d7769216f98009a": "O",
};

// helper to change state number from blockchain to state string
const toState = (state: Number) => {
  switch (state) {
    case 1:
      return "Registered";
    case 2:
      return "Deleted";
    case 3:
      return "Matched";
    default:
      return "";
  }
};

const useAdmin = (
  contract: Contract | null,
  isAdmin: boolean,
  address: string | undefined,
  provider: ethers.BrowserProvider | null
): {
  allDonorInfo: AllDonorInfo[] | undefined;
  allRecipientInfo: AllRecipientInfo[] | undefined;
  eventsOfMatched: MatchedEventsInfo[] | undefined;
  allInfoError: Error | undefined;
  allInfoIsLoading: boolean;
} => {
  const { donorAddress, recipientAddress } = useDataSet(contract);

  const {
    data: allInfo = {
      allDonorInfo: [],
      allRecipientInfo: [],
      eventsOfMatched: [],
    },
    error: allInfoError,
    isLoading: allInfoIsLoading,
  } = useSWR(
    () =>
      contract && address && isAdmin && donorAddress && recipientAddress
        ? "web3/allInfo"
        : null,
    async () => {
      try {
        const allDonorInfo = await getAllInfoWithRetries(
          contract,
          "getDonor",
          donorAddress
        );
        const allRecipientInfo = await getAllInfoWithRetries(
          contract,
          "getRecipient",
          recipientAddress
        );
        const eventsOfMatched = await getMatchedEvents(contract, "Matched");
        return {
          allDonorInfo,
          allRecipientInfo,
          eventsOfMatched,
        };
      } catch (error: any) {
        console.log("catching error on useSWE in useAdmin");
        console.error(error.message);
      }
    }
  );

  // to get all Infomations depends on the arguments "getDonor" and "getRecipient"
  const getAllInfo = async (
    contract: Contract | null,
    method: string,
    addresses: string[]
  ) => {
    try {
      if (contract && addresses.length > 0) {
        const Info = [];
        for (const address of addresses) {
          const tx = await contract[method](address);
          if (!tx) {
            continue;
          }
          // to get timestamp
          const eventSetters: Record<MethodType, string> = {
            getDonor: "RegisteredDonor",
            getRecipient: "RegisteredRecipient",
          };
          const eventSetter = eventSetters[method as MethodType];

          const events = await getEvents(contract, eventSetter, provider);
          if (!events) {
            throw new Error(`no events of ${method}`);
          }
          const timestamps = [];
          for (const log of events) {
            // to make sure args in log
            if ("args" in log && log.args[1] === address) {
              const res = await getTimestamp(log, provider);
              timestamps.push(res);
            }
          }
          const filteredTimestamp = timestamps.filter((event) => {
            return event !== undefined;
          })[0];
          if (method === "getDonor") {
            const info = {
              id: Number(tx[0]),
              donorAddress: address as string,
              name: tx[1] as string,
              bloodType: tx[2] as string,
              state: toState(Number(tx[3])),
              time: filteredTimestamp as string,
            };

            Info.push(info);
          } else if (method === "getRecipient") {
            const info = {
              id: Number(tx[0]),
              recipientAddress: address as string,
              name: tx[1] as string,
              bloodType: tx[2] as string,
              state: toState(Number(tx[3])),
              time: filteredTimestamp as string,
            };

            Info.push(info);
          }
        }

        return Info;
      } else {
        console.log(`no addresses[] to get info for ${method}`);
      }
    } catch (error: any) {
      console.log("catching error on getAllInfo in useAdmin");
      throw new Error(error);
    }
  };

  //  to get all information with retry located utils/retry.tsx
  const getAllInfoWithRetries = async (
    contract: Contract | null,
    method: string,
    addresses: string[]
  ) => {
    const maxRetries = 10;
    const maxBackoff = 64000;
    return await retry(
      () => getAllInfo(contract, method, addresses),
      maxRetries,
      maxBackoff
    );
  };

  // to get all Infomations depends on the arguments "getDonor" and "getRecipient"
  // const getAllInfo = async (
  //   contract: Contract | null,
  //   method: string,
  //   addresses: string[]
  // ) => {
  //   const maxRetries = 10;
  //   const maxBackoff = 64000;
  //   const Info = [];
  //   let retryCount = 0;
  //   while (retryCount < maxRetries) {
  //     try {
  //       if (contract && addresses.length > 0) {
  //         for (const address of addresses) {
  //           const tx = await contract[method](address);
  //           if (!tx) {
  //             continue;
  //           }
  //           // to get timestamp
  //           const eventSetters: Record<MethodType, string> = {
  //             getDonor: "RegisteredDonor",
  //             getRecipient: "RegisteredRecipient",
  //           };
  //           const eventSetter = eventSetters[method as MethodType];

  //           const events = await getEvents(contract, eventSetter, provider);
  //           if (!events) {
  //             throw new Error(`no events of ${method}`);
  //           }
  //           const timestamps = [];
  //           for (const log of events) {
  //             // to make sure args in log
  //             if ("args" in log && log.args[1] === address) {
  //               const res = await getTimestamp(log, provider);
  //               timestamps.push(res);
  //             }
  //           }
  //           const filteredTimestamp = timestamps.filter((event) => {
  //             return event !== undefined;
  //           })[0];
  //           if (method === "getDonor") {
  //             const info = {
  //               id: Number(tx[0]),
  //               donorAddress: address as string,
  //               name: tx[1] as string,
  //               bloodType: tx[2] as string,
  //               state: toState(Number(tx[3])),
  //               time: filteredTimestamp as string,
  //             };

  //             Info.push(info);
  //           } else if (method === "getRecipient") {
  //             const info = {
  //               id: Number(tx[0]),
  //               recipientAddress: address as string,
  //               name: tx[1] as string,
  //               bloodType: tx[2] as string,
  //               state: toState(Number(tx[3])),
  //               time: filteredTimestamp as string,
  //             };

  //             Info.push(info);
  //           }
  //         }

  //         return Info;
  //       } else {
  //         console.log(`no addresses[] to get info for ${method}`);
  //       }
  //     } catch (error: any) {
  //       console.log(error.message);
  //       if (error.code === 429) {
  //         let waitTime = Math.min(
  //           2 ** retryCount * 1000 + Math.round(Math.random() * 1000),
  //           maxBackoff
  //         );
  //         console.log(`Waithing for ${waitTime}ms before retrying...`);
  //         await new Promise((resolve) => setTimeout(resolve, waitTime));
  //         retryCount++;

  //         if (retryCount === maxRetries) {
  //           console.log(`Max retries reached...Refresh page and try again...`);
  //           return Info;
  //         }
  //       }
  //     }
  //   }
  // };

  // to get Matching events and set them to matchingInfo
  const getMatchedEvents = async (
    contract: Contract | null,
    eventName: string
  ) => {
    if (!contract || !provider) return;
    try {
      const events = await getEvents(contract, eventName, provider);
      if (!events) {
        throw new Error(`no events of ${eventName}`);
      }
      const result = [];
      for (const log of events) {
        const timestamp = await getTimestamp(log, provider);
        if ("args" in log) {
          const res = {
            donorAddress: log.args[0] as string,
            recipientAddress: log.args[1] as string,
            bloodType: Blood_TYPE_HASH[log.args[2].hash as string],
            time: timestamp as string,
          };
          result.push(res);
        }
      }
      return result;
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const {
    allDonorInfo: rawAllDonorInfo,
    allRecipientInfo: rawAllRecipientInfo,
    eventsOfMatched,
  } = allInfo || {};
  const allDonorInfo = rawAllDonorInfo as AllDonorInfo[] | undefined;
  const allRecipientInfo = rawAllRecipientInfo as
    | AllRecipientInfo[]
    | undefined;

  return {
    allDonorInfo,
    allRecipientInfo,
    eventsOfMatched,
    allInfoError,
    allInfoIsLoading,
  };
};
export default useAdmin;
