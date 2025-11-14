import * as XLSX from "xlsx";

export interface BranchTransferExcelRow {
  product: string;
  branch: string;
  quantity: number;
}

export function parseBranchTransferExcel(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<BranchTransferExcelRow>(sheet);
  return { rows, sheetName };
}

export function generateBranchTransferTemplate(
  warehouseName: string,
  products: { name: string }[],
  branches: { name: string }[]
) {
  const wsData = [["product", "branch", "quantity"]];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  const productSheet = XLSX.utils.aoa_to_sheet([
    ["Products"],
    ...products.map((p) => [p.name]),
  ]);
  const shelfSheet = XLSX.utils.aoa_to_sheet([
    ["Branches"],
    ...branches.map((s) => [s.name]),
  ]);
  const workbookObj = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbookObj, worksheet, warehouseName);
  XLSX.utils.book_append_sheet(workbookObj, productSheet, "Products");
  XLSX.utils.book_append_sheet(workbookObj, shelfSheet, "Branches");
  return XLSX.write(workbookObj, { bookType: "xlsx", type: "array" });
}
