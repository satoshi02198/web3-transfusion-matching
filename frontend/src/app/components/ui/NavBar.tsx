"use client";

import React, { useState } from "react";
import { useWeb3 } from "../providers/Provider";
import ActiveLink from "./ActiveLink";
import { Button } from "@/shadcnComponents/button";

type NavBarProps = {};

const NavBar: React.FC<NavBarProps> = () => {
  const { connectWallet, address, isAdmin } = useWeb3();

  return (
    <nav className="">
      <div>
        <div className="block sm:flex justify-between items-center px-6 py-4  bg-green-100">
          <div className="flex space-x-6">
            <ActiveLink href="/">Home</ActiveLink>
            <ActiveLink href="/register">Register</ActiveLink>
            {isAdmin && <ActiveLink href="/admins">Admins page</ActiveLink>}
            <ActiveLink href="/data">data</ActiveLink>
          </div>
          {address ? (
            <div className="pt-2 text-left">
              <span className="font-bold">Your address</span>:
              {isAdmin && <span className="text-red-800 font-bold">Admin</span>}{" "}
              {address.slice(0, 6) + "...." + address.slice(-6)}
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
