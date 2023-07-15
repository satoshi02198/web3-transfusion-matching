import React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  flexRender,
  VisibilityState,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcnComponents/table";
import { Button } from "@/shadcnComponents/button";
import { Input } from "@/shadcnComponents/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  forSearchString?: string;
}

const DataTable = <TData, TValue>({
  columns,
  data,
  forSearchString = "",
}: DataTableProps<TData, TValue>) => {
  // to sort Id and Time ascending
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // to filter addresses
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  // to set filter view on matching
  const [filterView, setFilterView] = React.useState<boolean>(true);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    pageCount: 10,
  });
  const currentPageIndex = table.getState().pagination.pageIndex;
  const totalPages = table.getState().pagination.pageSize;
  const pageNumberToDisplay = 4;

  return (
    <div className="flex flex-col space-y-2 bg-slate-50 border border-slate-800 rounded-md">
      <div
        className={`${
          forSearchString === "donorAddress" || "recipientAddress"
            ? "w-1/3"
            : "w-1/2"
        } flex space-x-1 mt-3 mr-2 self-end`}
      >
        {forSearchString === "donorAddress" && (
          <Input
            placeholder="Filter addresses..."
            value={
              (table.getColumn("donorAddress")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) => {
              table
                .getColumn("donorAddress")
                ?.setFilterValue(event.target.value);
            }}
          />
        )}
        {forSearchString === "recipientAddress" && (
          <Input
            placeholder="Filter addresses..."
            value={
              (table
                .getColumn("recipientAddress")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) => {
              table
                .getColumn("recipientAddress")
                ?.setFilterValue(event.target.value);
            }}
          />
        )}

        {forSearchString === "matching" && (
          <>
            <Input
              placeholder="Filter addresses..."
              value={
                (table
                  .getColumn(filterView ? "donorAddress" : "recipientAddress")
                  ?.getFilterValue() as string) ?? ""
              }
              onChange={(event) => {
                table
                  .getColumn(filterView ? "donorAddress" : "recipientAddress")
                  ?.setFilterValue(event.target.value);
              }}
              className="w-full "
            />
            <Button
              variant="outline"
              onClick={() => {
                setFilterView(!filterView);
                table
                  .getColumn(filterView ? "donorAddress" : "recipientAddress")
                  ?.setFilterValue("");
              }}
            >
              {filterView ? "donor" : "recipient"}
            </Button>
          </>
        )}
      </div>
      <div className="rounded-md border">
        <Table className="bg-white">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>

        {table.getPageOptions().map((option) => {
          if (option < pageNumberToDisplay || option === totalPages - 1) {
            return (
              <Button
                variant="ghost"
                key={option}
                className={`${
                  currentPageIndex === option
                    ? "text-green-500 hover:text-green-600"
                    : "text-slate-600 hover:text-slate-800"
                } px-1 hover:bg-slate-100 `}
                onClick={() => table.setPageIndex(option)}
              >
                {option + 1}
              </Button>
            );
          } else if (option === pageNumberToDisplay) {
            return <div key={option}>...</div>;
          } else {
            return null;
          }
        })}
        <div className="bg-slate-100 p-2 rounded-lg">
          {currentPageIndex + 1} of {totalPages}
        </div>
      </div>
    </div>
  );
};
export default DataTable;
