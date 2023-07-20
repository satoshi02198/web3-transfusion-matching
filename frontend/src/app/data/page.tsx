"use client";

import React from "react";

import { columns } from "../components/test/columns";
import { payments } from "../components/test/testData";
import { DataTable } from "../components/test/data-table";

type pageProps = {};

const Data: React.FC<pageProps> = () => {
  return (
    <>
      <div className="p-8 max-w-5xl">
        <DataTable columns={columns} data={payments} />
      </div>
    </>
  );
};
export default Data;
