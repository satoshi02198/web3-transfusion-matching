"use client";

import React, { useState } from "react";
import { useWeb3 } from "../components/providers/Provider";
import useRegister from "../components/hooks/useRegister";
import Skeleton from "../components/ui/Skeleton";
import RegisterModal from "../components/ui/modal/RegisterModal";
// shadcn ui components
import { Button } from "@/shadcnComponents/button";
import { Input } from "@/shadcnComponents/input";
import { Label } from "@/shadcnComponents/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcnComponents/select";

// HELPER TO RENDER STATES
const renderState = (state: Number | undefined) => {
  if (Number.isNaN(state)) {
    return "You are not registered";
  }
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

const Blood_TYPE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O"];

const Register: React.FC = () => {
  const { contract, address, provider } = useWeb3();
  const {
    stateAsDonor,
    stateAsRecipient,
    stateIsLoading,
    register,
    deRegister,
  } = useRegister(contract, address, provider);
  const [reciOrDor, setReciOrDor] = useState("");
  const [input, setInput] = useState({
    name: "",
    bloodType: "",
    emailAddress: "",
  });

  // TO RESET INPUTS
  const handleAfterRegi = () => {
    setReciOrDor("");
    setInput({
      name: "",
      bloodType: "",
      emailAddress: "",
    });
  };

  return (
    <div className="h-full sm:h-screen py-2 sm:px-14 flex flex-col items-center sm:flex-row sm:justify-center sm:items-start sm:space-x-4">
      <div className=" flex-col justify-center items-center w-[90%] sm:w-1/2  sm:h-[500px] bg-slate-100 text-center mt-2 sm:mt-4 pb-6 sm:py-4 space-y-4 rounded-md">
        <h1 className="py-4 sm:pt-6 text-lg font-bold">Register as</h1>
        <div className="flex justify-center items-center space-x-4">
          <Button
            className={`${
              reciOrDor === "Donor" ? "bg-slate-700" : "bg-slate-500"
            } hover:bg-slate-700`}
            onClick={() => setReciOrDor("Donor")}
          >
            Donor 🏥
          </Button>
          <Button
            className={`${
              reciOrDor === "Recipient" ? "bg-slate-700" : "bg-slate-500"
            } hover:bg-slate-700`}
            onClick={() => setReciOrDor("Recipient")}
          >
            Recipient 💚
          </Button>
        </div>
        <div className="">
          <Label htmlFor="name">Name</Label>
          <div>
            <Input
              className="w-2/3 sm:w-48 mx-auto"
              id="name"
              type="text"
              placeholder="Name"
              value={input.name}
              onChange={({ target: { value } }) =>
                setInput({
                  ...input,
                  name: value,
                })
              }
            />
          </div>
        </div>
        <div className="">
          <Label htmlFor="name">Email Address</Label>
          <div>
            <Input
              className="w-2/3 sm:w-60 mx-auto"
              id="emailAddress"
              type="email"
              placeholder="Email Address"
              value={input.emailAddress}
              onChange={({ target: { value } }) =>
                setInput({
                  ...input,
                  emailAddress: value,
                })
              }
            />
          </div>
        </div>
        <div>
          <Label>BloodType </Label>
          <div className="">
            <Select
              value={input.bloodType}
              onValueChange={(value) =>
                setInput({
                  ...input,
                  bloodType: value,
                })
              }
            >
              <SelectTrigger className="w-[180px] bg-white mx-auto">
                <SelectValue>
                  {input.bloodType || "Select a blood type"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                {Blood_TYPE.map((item, index) => (
                  <SelectItem key={index} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-10">
          <RegisterModal
            reciOrDor={reciOrDor}
            input={input}
            variants="register"
            address={address}
            register={register}
            handleAfterRegi={handleAfterRegi}
          ></RegisterModal>
        </div>
      </div>
      <div className="w-[90%] sm:w-1/2 sm:h-[500px] flex-col justify-center items-center bg-slate-100 text-center space-y-4 mt-2 sm:mt-4 pb-6 sm:py-4 rounded-md">
        {/* status check */}
        <h1 className="py-6 text-lg font-bold">Check your status</h1>
        {address ? (
          <div>
            {stateIsLoading ? (
              <Skeleton width="40" height="6" />
            ) : (
              <p>As Donor: {renderState(stateAsDonor)}</p>
            )}
            {stateIsLoading ? (
              <Skeleton width="40" height="6" />
            ) : (
              <p>As Recipient: {renderState(stateAsRecipient)}</p>
            )}
          </div>
        ) : (
          <p>Please connect your wallet to check status</p>
        )}
        {/* de-register */}
        <h1 className="py-6 text-lg font-bold">DeRegister</h1>
        <p className="font-semibold text-slate-600">
          Only your status is Registered, deregister button shown up
        </p>
        <div className="flex justify-center items-center sm:space-x-2">
          {stateAsDonor === 1 && (
            <RegisterModal
              variants="deregister"
              deRegister={deRegister}
              method="Donor"
            ></RegisterModal>
          )}
          {stateAsRecipient === 1 && (
            <RegisterModal
              variants="deregister"
              deRegister={deRegister}
              method="Recipient"
            ></RegisterModal>
          )}
        </div>
      </div>
    </div>
  );
};
export default Register;
