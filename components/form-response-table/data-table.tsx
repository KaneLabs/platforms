"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableBodyRows = table.getRowModel().rows;

  return (
    <div className="rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-gray-300">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {tableBodyRows?.length ? (
            tableBodyRows.map((row) => {
              const visibleCells = row.getVisibleCells();
              return (
                <TableRow
                  key={row.id}
                  className={row.index % 2 === 0 ? "bg-gray-300 hover:bg-gray-300 border-0" : "bg-gray-100 hover:bg-gray-100 border-0"}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {visibleCells.map((cell, cellIndex) => (
                    <TableCell 
                      key={cell.id}
                      className={`${
                        cellIndex === 0 ? "rounded-l-lg" : ""
                      } ${
                        cellIndex === visibleCells.length - 1 ? "rounded-r-lg" : ""
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, { 
                        ...cell.getContext(), 
                        rows: tableBodyRows 
                      })}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
