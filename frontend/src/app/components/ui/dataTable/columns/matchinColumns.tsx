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

type Matching = {
  donorAddress: string;
  recipientAddress: string;
  bloodType: string;
  time: string;
};

export const matchingColumns: ColumnDef<Matching>[] = [
  {
    accessorKey: "donorAddress",
    header: "Donor Address",
  },
  {
    accessorKey: "recipientAddress",
    header: "Recipient Address",
  },
  {
    accessorKey: "bloodType",
    header: "Blood Type",
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
      const matching = row.original;
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
                  navigator.clipboard.writeText(matching.donorAddress);
                  toast("Copied!", {
                    containerId: "copy",
                    closeButton: false,
                    icon: "🟢",
                  });
                }}
              >
                Copy DonorAddress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(matching.recipientAddress);
                  toast("Copied!", {
                    containerId: "copy",
                    closeButton: false,
                    icon: "🟢",
                  });
                }}
              >
                Copy RecipientAddress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
