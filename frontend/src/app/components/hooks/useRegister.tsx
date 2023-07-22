import { BrowserProvider, Contract } from "ethers";
import useSWR from "swr";
import { getEvents } from "../../../../utils/event";
import { DataType } from "../../../../utils/toast";
import { encrypt } from "../../../../utils/encrypt";
import { retry } from "../../../../utils/retry";

const useRegister = (
  contract: Contract | null,
  address: string | undefined,
  provider: BrowserProvider | null
) => {
  const { data, isLoading: stateIsLoading } = useSWR(
    () => (contract && address ? "web3/register" : null),
    async () => {
      const state = await checkStatusWithRetries(address);
      return state;
    }
  );
  // helper function to check status for individual
  const checkStatus = async (address: string | undefined) => {
    try {
      let stateAsD;
      let stateAsR;
      // check state as donor
      const checkDonorState = await contract?.getDonorState(address);
      if (checkDonorState) {
        stateAsD = checkDonorState;
      } else {
        console.log("This address is not registered as a donor");
      }
      // check state as recipient
      const checkRecipientState = await contract?.getRecipientState(address);
      if (checkRecipientState) {
        stateAsR = checkRecipientState;
      } else {
        console.log("This address is not registered as a recipient");
      }
      // change bigInt to number
      const stateAsDonor = Number(stateAsD);
      const stateAsRecipient = Number(stateAsR);
      return {
        stateAsDonor,
        stateAsRecipient,
      };
    } catch (error: any) {
      console.log("catching error on checkStatus() in useRegister()");
      console.log(error.message);
      throw new Error(error.message);
    }
  };

  const checkStatusWithRetries = async (address: string | undefined) => {
    const maxRetries = 10;
    const maxBackoff = 64000;
    return await retry(
      () => checkStatus(address),
      maxRetries,
      maxBackoff,
      "checkStatus"
    );
  };

  // helper function to register
  const register = async (
    reciOrDor: string,
    input: { name: string; bloodType: string; emailAddress: string },
    address: string | undefined
  ) => {
    try {
      const encryptedName = await encrypt(input.name);
      const encryptedBloodType = await encrypt(input.bloodType);
      let tx;
      if (reciOrDor === "Donor") {
        tx = await contract?.registerDonor(encryptedName, encryptedBloodType);
      } else if (reciOrDor === "Recipient") {
        tx = await contract?.registerRecipient(
          encryptedName,
          encryptedBloodType
        );
      }
      // to deal state change donorAddress after tx, no need to reload
      if (tx) {
        // console.log("🚀 ~ register ~ tx:", tx);
        const result = await tx.wait();

        // to check matching proccess fired or not
        let isMatched = false;
        const matchedEvents = await getEvents(contract, "Matched", provider);
        if (matchedEvents) {
          const newestMatchedEvent = matchedEvents[matchedEvents.length - 1];
          if (newestMatchedEvent && "args" in newestMatchedEvent) {
            const args = newestMatchedEvent.args;
            isMatched = args.includes(address);
          } else {
            console.log("🚀 ~ register ~ no args in the event");
          }
        } else {
          console.error("🚀 ~ register ~ no matched events");
        }
        const toToast: DataType = {
          transactionHash: result.hash as string,
          isMatched: isMatched,
          methodName: "Register",
          donorOrRecipient: reciOrDor,
          address: address,
          input: input,
        };
        return toToast;
      } else {
        console.error("🚀 ~ register ~ transaction failed");
        const defaultToToast: DataType = {
          transactionHash: "",
          isMatched: false,
          methodName: "",
          donorOrRecipient: "",
          address: "",
          input: {
            name: "",
            bloodType: "",
            emailAddress: "",
          },
        };
        return Promise.resolve(defaultToToast);
      }
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  };

  // to de-register depend on arguments
  const deRegister = async (donorOrRecipient: string) => {
    try {
      if (!contract) {
        throw new Error("contract is not defined");
      }
      // SETTERS TO CHOOSE WHICH METHOD TO CALL
      const setters = {
        Donor: "deregisterDonor",
        Recipient: "deregisterRecipient",
      };
      const setter = setters[donorOrRecipient as "Donor" | "Recipient"];
      const tx = await contract[setter](address);
      const result = await tx.wait();
      const toToast = {
        transactionHash: result.hash as string,
        methodName: "Deregister",
      };
      return toToast;
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  };

  const { stateAsDonor, stateAsRecipient } = data || {};
  return {
    stateAsDonor,
    stateAsRecipient,
    stateIsLoading,
    register,
    deRegister,
  };
};
export default useRegister;
