"use client";

import React, { useState } from "react";
import {
  getKeysWithKey,
  getListValue,
  getUserData,
  pushToLists,
  getAllKeysWithScan,
  setUserData,
} from "../../../../utils/actions";
import useSWR from "swr";
import { Skeleton } from "@/shadcnComponents/skeleton";
import { Button } from "@/shadcnComponents/button";
import { Input } from "@/shadcnComponents/input";
type ForKVProps = {};

const CheckUserDataWithKV: React.FC<ForKVProps> = () => {
  //   const { data, isLoading } = useSWR(
  //     () => (address ? "/api/user" : null),
  //     async () => {
  //       const userEmail = await getUserData(address);
  //       return userEmail;
  //     }
  //   );
  //   console.log("🚀 ~ isLoading:", isLoading);
  const [user, setUser] = useState(null);
  // to check email address with web3 address
  const [input, setInput] = useState("");

  return (
    <div className="p-6 space-y-4">
      {/* {isLoading ? (
        <Skeleton className="bg-slate-300 w-28 h-12" />
      ) : (
        <p>{data}</p>
      )} */}
      <Input
        className="w-1/2"
        id="web3Address"
        type="text"
        placeholder="web3Address"
        value={input}
        onChange={({ target: { value } }) => setInput(value)}
      />
      {/* <Button
        onClick={async () => {
          const data = await getUserData(input);
          console.log(data);
          setUser(data);
        }}
      >
        Get User Data
      </Button> */}
      <Button
        onClick={async () => {
          const data = await getKeysWithKey();
          console.log(data);
        }}
      >
        Get Keys
      </Button>
      <Button
        onClick={() => {
          pushToLists("users", {
            "0xsjglvle": { name: "satoshi", address: "" },
          });
        }}
      >
        pushToLists
      </Button>
      <Button
        onClick={() => {
          getAllKeysWithScan();
        }}
      >
        scan all keys
      </Button>
      <Button
        onClick={() => {
          getListValue("users");
        }}
      >
        get list value
      </Button>
      <Button
        onClick={async () => {
          const res = await setUserData({
            userAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            emailAddress: "satoshi@super.com",
            name: "satoshi okazaki",
          });
          console.log(res);
        }}
      >
        set user data
      </Button>
      {/* <p>User Email: {user?.emailAddress}</p>
      <p>User Name: {user?.name}</p> */}
    </div>
  );
};
export default CheckUserDataWithKV;
