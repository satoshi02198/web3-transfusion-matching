"use client";

import { Contract, ethers } from "ethers";
import useSWR from "swr";
import { getEvents, getTimestamp } from "../../../../utils/event";
import useDataSet from "./useDataSet";
import { retry } from "../../../../utils/retry";
import { decrypt } from "../../../../utils/encrypt";

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
  [process.env.NEXT_PUBLIC_BLOOD_TYPE1 as string]: "A+",
  [process.env.NEXT_PUBLIC_BLOOD_TYPE2 as string]: "A-",
  [process.env.NEXT_PUBLIC_BLOOD_TYPE3 as string]: "B+",
  [process.env.NEXT_PUBLIC_BLOOD_TYPE4 as string]: "B+",
  [process.env.NEXT_PUBLIC_BLOOD_TYPE5 as string]: "AB+",
  [process.env.NEXT_PUBLIC_BLOOD_TYPE6 as string]: "AB-",
  [process.env.NEXT_PUBLIC_BLOOD_TYPE7 as string]: "O",
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
        const eventsOfMatched = await getMatchedEventsWithRetries(
          contract,
          "Matched"
        );
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
              name: await decrypt(tx[1] as string),
              bloodType: await decrypt(tx[2] as string),
              state: toState(Number(tx[3])),
              time: filteredTimestamp as string,
            };

            Info.push(info);
          } else if (method === "getRecipient") {
            const info = {
              id: Number(tx[0]),
              recipientAddress: address as string,
              name: await decrypt(tx[1] as string),
              bloodType: await decrypt(tx[2] as string),
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
      console.error(error.message);
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
      maxBackoff,
      "getAllInfo"
    );
  };

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
      console.log("catching error on getMatchedEvents in useAdmin");
      console.log(error.message);
      throw new Error(error.message);
    }
  };

  //  to get matched events information with retry located utils/retry.tsx
  const getMatchedEventsWithRetries = async (
    contract: Contract | null,
    eventName: string
  ) => {
    const maxRetries = 10;
    const maxBackoff = 64000;
    return await retry(
      () => getMatchedEvents(contract, eventName),
      maxRetries,
      maxBackoff,
      "getMatchedEvents"
    );
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
