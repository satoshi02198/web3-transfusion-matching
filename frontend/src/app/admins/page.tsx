"use client";

import React, { useEffect, useState } from "react";
import { useWeb3 } from "../components/providers/Provider";
import { useRouter } from "next/navigation";
import useAdmin from "../components/hooks/useAdmin";
import { Button } from "@/shadcnComponents/button";
import { donorColumns } from "../components/ui/dataTable/columns/donorColumns";
import { recipientColumns } from "../components/ui/dataTable/columns/recipientColumns";
import { matchingColumns } from "../components/ui/dataTable/columns/matchinColumns";
import DataTable from "../components/ui/dataTable/DataTable";
import { Skeleton } from "@/shadcnComponents/skeleton";

type pageProps = {};

export type AllDonorInfo = {
  id: number | null;
  address: string | undefined;
  name: string | null;
  bloodType: string | null;
  state: number | null;
  time: string;
};
export type AllRecipientInfo = {
  id: number | null;
  address: string | undefined;
  name: string | null;
  bloodType: string | null;
  state: number | null;
  time: string;
};

const Admins: React.FC<pageProps> = () => {
  const router = useRouter();
  const { contract, provider, address, isAdmin } = useWeb3();
  const {
    allDonorInfo,
    allRecipientInfo,
    eventsOfMatched,
    allInfoError,
    allInfoIsLoading,
  } = useAdmin(contract, isAdmin, address, provider);

  // "Donors" || "Recipients" || "Matching"
  const [view, setView] = useState<string>("Donors");

  // tags for table
  const tags = ["Donors", "Recipients", "Matching"];
  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
      return;
    }
  }, [contract, isAdmin, provider]);

  if (!isAdmin) {
    return <div className="h-screen">This page for admins</div>;
  }

  return (
    <div className="h-screen p-6">
      {}
      <div className="flex space-x-2 text-lg font-semibold px-1">
        {tags.map((tag, index) => (
          <Button
            size="sm"
            key={index}
            className={`px-8 py-4 font-semibold rounded-t-md rounded-b-none ${
              view === tag ? "bg-slate-600" : "bg-slate-400"
            }  hover:bg-slate-600 transition-all duration-300`}
            onClick={() => {
              setView(tag);
            }}
          >
            {tag}
          </Button>
        ))}
      </div>
      {!allInfoError && allInfoIsLoading ? (
        <Skeleton className="w-full h-[500px] bg-slate-200  rounded-lg" />
      ) : (
        <div>
          {view === "Donors" &&
            allDonorInfo !== undefined &&
            allDonorInfo.length > 0 && (
              <DataTable
                columns={donorColumns}
                data={allDonorInfo}
                forSearchString="donorAddress"
              />
            )}
          {view === "Recipients" &&
            allRecipientInfo !== undefined &&
            allRecipientInfo.length > 0 && (
              <DataTable
                columns={recipientColumns}
                data={allRecipientInfo}
                forSearchString="recipientAddress"
              />
            )}
          {view === "Matching" &&
            eventsOfMatched !== undefined &&
            eventsOfMatched.length > 0 && (
              <DataTable
                columns={matchingColumns}
                data={eventsOfMatched}
                forSearchString="matching"
              />
            )}
        </div>
      )}
    </div>
  );
};
export default Admins;
