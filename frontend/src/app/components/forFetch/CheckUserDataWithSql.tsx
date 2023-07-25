import React, { useState } from "react";
import { Button } from "@/shadcnComponents/button";
import { Input } from "@/shadcnComponents/input";
import {
  deleteDataWithWeb3Address,
  getUserDataByWeb3Address,
} from "../../../../utils/actions";

const CheckUserDataWithSql: React.FC = ({}) => {
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");

  return (
    <div className="p-8 space-y-4">
      <Input
        className="w-1/2"
        id="web3Address"
        type="text"
        placeholder="web3Address"
        value={input}
        onChange={({ target: { value } }) => setInput(value)}
      />
      <div className="space-x-2">
        <Button
          variant={"outline"}
          className="bg-slate-200"
          onClick={async () => {
            const res = await getUserDataByWeb3Address(input);
            const { rows } = res;
            console.log(rows);
            const email = rows[0]?.email;
            setEmail(email);
          }}
        >
          Check Email
        </Button>
        {/* <Button onClick={async () => await createTable()}>create table</Button> */}

        <Button
          variant={"outline"}
          className="bg-slate-200"
          onClick={async () => {
            const res = await deleteDataWithWeb3Address(input);
            if (res) {
              alert("data successfully deleted");
            }
          }}
        >
          Delete data with web3Address
        </Button>
      </div>
      <div className="mt-4">
        <p>UserEmail: {email}</p>
      </div>
    </div>
  );
};
export default CheckUserDataWithSql;
