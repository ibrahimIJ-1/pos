import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, BarcodeIcon, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BranchProduct, Product } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { generateBarcodeFrontEnd } from "@/lib/utils/barcode-frontend";
import { useDownloadBarcodePdf } from "@/lib/products-service";
import { useTranslations } from "next-intl";

interface ProductTableProps {
  data: (Product & { BranchProduct?: BranchProduct[] })[];
  selectedIds: string[];
  setSelectedIds: (ids:string[]) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({
  data,
  onView,
  onEdit,
  onDelete,
  selectedIds,
  setSelectedIds
}: ProductTableProps) {
  const t = useTranslations();
  const download = useDownloadBarcodePdf();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const columns: ColumnDef<Product & { BranchProduct?: BranchProduct[] }>[] = [
    {
      accessorKey: "selected",
      header: "",
      cell: ({ row }) => {
        const imageUrl = row.original.image_url || "/placeholder.svg";
        return (
          <div className="relative h-12 w-12">
            <input
              type="checkbox"
              checked={selectedIds.findIndex((c) => c == row.original.id) != -1}
              onChange={(e) => {
                e.stopPropagation();
                const ind = selectedIds.findIndex((c) => c == row.original.id);
                if (ind == -1) {
                  setSelectedIds([...selectedIds, row.original.id]);
                } else {
                  const tempIds = selectedIds.filter(
                    (c) => c != row.original.id
                  );
                  setSelectedIds(tempIds);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "image_url",
      header: t("Image"),
      cell: ({ row }) => {
        const imageUrl = row.original.image_url || "/placeholder.svg";
        return (
          <div className="relative h-12 w-12">
            <img
              src={imageUrl}
              alt={row.original.name}
              className="h-full w-full object-cover rounded-md"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            {t("Name")}
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "barcode",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            {t("Barcode")}
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        );
      },
      cell: ({ row }) => {
        if (row.getValue("barcode")) {
          const svgRef = generateBarcodeFrontEnd(row.getValue("barcode"));
          if (svgRef)
            return (
              <div>
                <img
                  className="w-40 h-20 cursor-pointer"
                  src={svgRef}
                  alt="Barcode"
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(`
                <html>
                  <head>
                    <title>Print Barcode</title>
                    <style>
                      body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                      img { max-width: 100%; height: auto; }
                    </style>
                  </head>
                  <body onload="window.print(); window.close();">
                    <img src="${svgRef}" alt="Barcode" />
                  </body>
                </html>
              `);
                      printWindow.document.close();
                    }
                  }}
                />
              </div>
            );
        } else {
          return <div className="font-medium">{row.getValue("barcode")}</div>;
        }
      },
    },
    // {
    //   accessorKey: "sku",
    //   header: "SKU",
    //   cell: ({ row }) => (
    //     <div className="text-sm text-muted-foreground">
    //       {row.getValue("sku")}
    //     </div>
    //   ),
    // },
    // {
    //   accessorKey: "price",
    //   header: ({ column }) => {
    //     return (
    //       <Button
    //         variant="ghost"
    //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //         className="p-0 hover:bg-transparent"
    //       >
    //         Price
    //         {column.getIsSorted() === "asc" ? (
    //           <ArrowUp className="ml-2 h-4 w-4" />
    //         ) : column.getIsSorted() === "desc" ? (
    //           <ArrowDown className="ml-2 h-4 w-4" />
    //         ) : null}
    //       </Button>
    //     );
    //   },
    //   cell: ({ row }) => (
    //     <div className="font-bold">
    //       ${(row.getValue("price") as number).toFixed(2)}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "category",
      header: t("Category"),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue("category") ? (
            <Badge variant="outline">{row.getValue("category")}</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    // {
    //   accessorKey: "stock",
    //   header: ({ column }) => {
    //     return (
    //       <Button
    //         variant="ghost"
    //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //         className="p-0 hover:bg-transparent"
    //       >
    //         Stock
    //         {column.getIsSorted() === "asc" ? (
    //           <ArrowUp className="ml-2 h-4 w-4" />
    //         ) : column.getIsSorted() === "desc" ? (
    //           <ArrowDown className="ml-2 h-4 w-4" />
    //         ) : null}
    //       </Button>
    //     );
    //   },
    //   cell: ({ row }) => {
    //     const isLowStock  = row.original.BranchProduct.some(bp=>bp.stock<=bp.low_stock_threshold);

    //     return (
    //       <div
    //         className={`font-medium ${isLowStock ? "text-destructive" : ""}`}
    //       >
    //         {isLowStock && (
    //           <Badge variant="destructive" className="ml-2 text-xs">
    //             Low
    //           </Badge>
    //         )}
    //       </div>
    //     );
    //   },
    // },
    {
      id: "actions",
      header: t("Actions"),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center justify-start ">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                download.mutate([product.id]);
              }}
            >
              <BarcodeIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

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
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="rounded-md border neon-card neon-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-start">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onView(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t("No products found")}.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-4 py-4 border-t">
        <div className="flex-1 text-sm text-muted-foreground">
          {t("Showing")} {table.getRowModel().rows.length} {t("of")} {data.length} {t("product/s")}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t("Previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t("Next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
