import React from "react";
import { Payment, columns } from "../components/test/columns";

import { payments } from "../components/test/testData";
import { DataTable } from "../components/test/data-table";
import Transaction from "../components/ui/dataTable/getEvents/Transaction";

type pageProps = {};

const Data: React.FC<pageProps> = () => {
  return (
    <div className="p-8 max-w-5xl">
      <Transaction
        address={"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}
        DonorOrRecipient="RegisteredDonor"
      />
      <DataTable columns={columns} data={payments} />
    </div>
  );
};
export default Data;
