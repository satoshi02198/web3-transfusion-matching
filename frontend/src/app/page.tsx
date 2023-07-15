"use client";

import { useState, useEffect } from "react";

import { ethers } from "ethers";
import { useWeb3 } from "./components/providers/Provider";
import Skeleton from "./components/ui/Skeleton";
import useData from "./components/hooks/useData";
import useDataSet from "./components/hooks/useDataSet";
const NETWORK_ID = Number(process.env.NEXT_PUBLIC_NETWORK_ID);

type DonorInfo = {
  id: number | null;
  name: string | null;
  bloodType: string | null;
  state: number | null;
};

export type AllDonorInfo = {
  address: string | undefined;
  id: number | null;
  name: string | null;
  bloodType: string | null;
  state: number | null;
};

const Home = () => {
  const { contract } = useWeb3();

  const { donorAddress, recipientAddress, donorsStatus, dataIsLoading } =
    useDataSet(contract);

  const matchingNum = donorsStatus?.filter((state) => state === 3).length;

  const pushToInstallWallet = () => {
    return (
      <p>
        please install{" "}
        <a
          href="https://metamask.io/"
          target="_blank"
          className="border-b border-slate-800"
        >
          Meta Mask
        </a>{" "}
      </p>
    );
  };

  return (
    <div className="h-screen py-2 sm:px-10">
      <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0  items-center justify-between text-center mx-auto">
        <div className="px-2 py-6 bg-slate-200 w-4/5 rounded-md">
          <h1 className="font-bold">Donor number</h1>

          {dataIsLoading ? (
            <Skeleton height="4" width="20" />
          ) : contract ? (
            <p>{donorAddress.length}</p>
          ) : (
            <div>{pushToInstallWallet()}</div>
          )}
        </div>
        <div className="px-2 py-6 bg-slate-200 w-4/5 rounded-md">
          <h1 className="font-bold">Recipient number</h1>
          {dataIsLoading ? (
            <Skeleton height="4" width="20" />
          ) : contract ? (
            <p>{recipientAddress.length}</p>
          ) : (
            <div>{pushToInstallWallet()}</div>
          )}
        </div>
        <div className="px-2 py-6 bg-slate-200 w-4/5 rounded-md">
          <h1 className="font-bold">Matching number</h1>
          {dataIsLoading ? (
            <Skeleton height="4" width="20" />
          ) : contract ? (
            <p>{matchingNum} pair</p>
          ) : (
            <div>{pushToInstallWallet()}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
