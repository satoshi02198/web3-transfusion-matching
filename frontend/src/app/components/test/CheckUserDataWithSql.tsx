import { Button } from "@/shadcnComponents/button";
import React, { useState } from "react";
import {
  createTable,
  deleteData,
  deleteTable,
  getUserDataByWeb3Address,
} from "../../../../utils/actions";
import { Input } from "@/shadcnComponents/input";

type CheckUserDataWithSqlProps = {};

const CheckUserDataWithSql: React.FC<CheckUserDataWithSqlProps> = ({}) => {
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
      <Button
        onClick={async () => {
          const res = await getUserDataByWeb3Address(input);
          const { rows } = res;
          console.log("🚀 ~ onClick={ ~ rows:", rows);
          setEmail(rows[0]?.email);
        }}
      >
        Check Email
      </Button>
      <Button
        onClick={async () => await deleteData("userData5", "Email", "awat@")}
      >
        Delete data
      </Button>
      <Button onClick={() => createTable()}>create Table</Button>
      <Button onClick={async () => await deleteTable("userData")}>
        delete Table
      </Button>

      <div>
        <p>UserEmail: {email}</p>
      </div>
    </div>
  );
};
export default CheckUserDataWithSql;
