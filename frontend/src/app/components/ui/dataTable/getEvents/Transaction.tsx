"use client";

import { useWeb3 } from "@/app/components/providers/Provider";
import React from "react";
import { getEvents } from "../../../../../../utils/event";
import useSWR from "swr";

type TransactionProps = {
  address: string;
  DonorOrRecipient: "RegisteredDonor" | "RegisteredRecipient";
};

const Transaction: React.FC<TransactionProps> = ({
  address,
  DonorOrRecipient,
}) => {
  const { contract, provider } = useWeb3();
  const fetcher = async () => {
    try {
      const events = await getEvents(contract, DonorOrRecipient, provider);
      let transaction = "";
      if (!events) return "";
      for (const log of events) {
        if ("args" in log && log.args[1] === address) {
          transaction = log.transactionHash;
        }
      }
      return transaction;
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const { data, error } = useSWR(
    () => (contract && provider && address ? "event/transaction" : null),
    fetcher
  );

  return (
    <>
      {!error && (
        <div className="break-words">
          <button onClick={() => alert(data)}>see Transaction</button>
        </div>
      )}
    </>
  );
};
export default Transaction;
