import * as XLSX from "xlsx";

export interface StockInExcelRow {
  product: string;
  shelf: string;
  quantity: number;
}

export function parseStockInExcel(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<StockInExcelRow>(sheet);
  return { rows, sheetName };
}

export function generateStockInTemplate(
  warehouseName: string,
  products: { name: string }[],
  shelves: { name: string }[]
) {
  const wsData = [["product", "shelf", "quantity"]];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  const productSheet = XLSX.utils.aoa_to_sheet([
    ["Products"],
    ...products.map((p) => [p.name]),
  ]);
  const shelfSheet = XLSX.utils.aoa_to_sheet([
    ["Shelves"],
    ...shelves.map((s) => [s.name]),
  ]);
  const workbookObj = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbookObj, worksheet, warehouseName);
  XLSX.utils.book_append_sheet(workbookObj, productSheet, "Products");
  XLSX.utils.book_append_sheet(workbookObj, shelfSheet, "Shelves");
  return XLSX.write(workbookObj, { bookType: "xlsx", type: "array" });
}
