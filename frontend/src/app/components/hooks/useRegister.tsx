import { BrowserProvider, Contract } from "ethers";
import useSWR from "swr";
import { getEvents } from "../../../../utils/event";
import { DataType } from "../../../../utils/toast";

type useRegisterProps = {};

const useRegister = (
  contract: Contract | null,
  address: string | undefined,
  provider: BrowserProvider | null
) => {
  const { data, isLoading: stateIsLoading } = useSWR(
    () => (contract && address ? "web3/register" : null),
    async () => {
      const state = await checkStatus(address);
      return state;
    }
  );

  // helper function to check status for individual
  const checkStatus = async (address: string | undefined) => {
    try {
      let stateAsD;
      let stateAsR;
      const checkDonorState = await contract?.getDonorState(address);
      if (checkDonorState) {
        stateAsD = checkDonorState;
      } else {
        console.log("there is no donor for this address");
      }
      const checkRecipientState = await contract?.getRecipientState(address);
      if (checkRecipientState) {
        stateAsR = checkRecipientState;
      } else {
        console.log("there is no recipient for this address");
      }
      const stateAsDonor = Number(stateAsD);
      const stateAsRecipient = Number(stateAsR);
      return {
        stateAsDonor,
        stateAsRecipient,
      };
    } catch (error: any) {
      console.log(error.message);
    }
  };

  // to register donor
  const register = async (
    reciOrDor: string,
    input: { name: string; bloodType: string },
    address: string | undefined
  ) => {
    try {
      // call function depends on donor or recipient
      let tx;
      if (reciOrDor === "Donor") {
        tx = await contract?.registerDonor(input.name, input.bloodType);
      } else if (reciOrDor === "Recipient") {
        tx = await contract?.registerRecipient(input.name, input.bloodType);
      }

      // to deal state change donorAddress after tx, no need to reload
      if (tx) {
        console.log("🚀 ~ register ~ tx:", tx);
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
        };
        return toToast;
      } else {
        console.error("🚀 ~ register ~ transaction failed");
        const defaultToToast: DataType = {
          transactionHash: "",
          isMatched: false,
          methodName: "",
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
