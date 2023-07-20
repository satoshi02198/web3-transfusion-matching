import { setUserData } from "./utils/actions";

const register = async (
  reciOrDor: string,
  input: { name: string; bloodType: string; emailAddress: string },
  address: string | undefined
) => {
  try {
    const setEmail = await setUserData({
      userAddress: address as string,
      emailAddress: input.emailAddress,
      name: input.name,
    });
    if (setEmail) {
      console.log(setEmail);
    }
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
