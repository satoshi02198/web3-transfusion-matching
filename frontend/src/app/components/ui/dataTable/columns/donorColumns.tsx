"use client";

import { Button } from "@/shadcnComponents/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "react-toastify";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shadcnComponents/dropdown-menu";
import Transaction from "../getEvents/Transaction";

type registeredDonor = {
  id: number;
  donorAddress: string;
  name: string;
  bloodType: string;
  state: string;
  time: string;
};

export const donorColumns: ColumnDef<registeredDonor>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "donorAddress",
    header: "Donor Address",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "bloodType",
    header: "Blood Type",
  },
  {
    accessorKey: "state",
    header: "State",
  },
  {
    accessorKey: "time",
    header: ({ column }) => (
      <div>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
  },
  {
    id: "action",
    cell: ({ row }) => {
      const register = row.original;
      return (
        <div className=" text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-1/2">
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>options</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(register.donorAddress);
                  toast("Copied!", {
                    containerId: "copy",
                    icon: "🟢",
                  });
                }}
              >
                Copy Address
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Transaction
                  address={register.donorAddress}
                  DonorOrRecipient="RegisteredDonor"
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
