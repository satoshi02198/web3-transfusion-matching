"use client";

import React from "react";
import { useWeb3 } from "../providers/Provider";
import ActiveLink from "./ActiveLink";
import { Button } from "@/shadcnComponents/button";
import useNetwork from "../hooks/useNetwork";
import Image from "next/image";

const NavBar: React.FC = () => {
  const { connectWallet, address, isAdmin, provider } = useWeb3();
  const { currentNetwork, targetNetwork, switchToTargetNetwork } =
    useNetwork(provider);

  return (
    <nav>
      <div>
        {address && currentNetwork?.name !== targetNetwork.name ? (
          <div className="relative flex flex-col sm:flex-row sm:space-x-4 items-center justify-center text-slate-700 bg-blue-200  py-3 ">
            <p className="underline">Please change to {targetNetwork.name}</p>
            <Button
              variant="outline"
              onClick={async () => {
                await switchToTargetNetwork();
              }}
            >
              Switch to {targetNetwork.name}
            </Button>
          </div>
        ) : (
          <div>
            <p></p>
          </div>
        )}
        <div className="block sm:flex justify-between items-center px-6 py-4  bg-green-200">
          <div className="flex space-x-6 text-slate-600 font-semibold sm:text-lg ">
            <ActiveLink href="/">Home</ActiveLink>
            <ActiveLink href="/register">Register</ActiveLink>
            {isAdmin && <ActiveLink href="/admins">Admins page</ActiveLink>}
          </div>
          {address ? (
            <div className="flex flex-col sm:flex-row items-center justify-center pt-2 text-left text-slate-700">
              <div>
                <span className="font-bold">Your address :</span>
                {isAdmin && (
                  <span className="text-indigo-600 font-bold">Admin</span>
                )}
              </div>
              <p className="sm:ml-4">
                {address.slice(0, 6) + "...." + address.slice(-6)}
              </p>
              <div className="hidden sm:flex items-center justify-center space-x-1 sm:ml-2">
                <Image
                  src={currentNetwork?.logo ?? ""}
                  width={25}
                  height={25}
                  alt="network logo"
                />
                <p> {currentNetwork?.name}</p>
              </div>
            </div>
          ) : (
            <Button
              size={"lg"}
              variant={"outline"}
              className="text-base"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
export default NavBar;
