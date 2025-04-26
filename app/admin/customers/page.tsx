"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CustomerDialog } from "@/components/customer/CustomerDialog";
import { CustomerDetails } from "@/components/customer/CustomerDetails";
import { CheckCircle, XCircle, UserPlus, User, Users } from "lucide-react";
import { UserRole, Permission } from "@/lib/permissions";
import { PermissionGuard } from "@/hooks/usePermissions";
import { Customer } from "@prisma/client";
import { useCustomers } from "@/lib/customers-service";
import { useTranslations } from "next-intl";

export default function Customers() {
  const t = useTranslations();
  const { data: customers, isLoading, refetch } = useCustomers();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >(undefined);
  const [viewMode, setViewMode] = useState<"list" | "details">("list");

  // Table column definitions
  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: t("Name"),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "email",
      header: t("Email"),
      cell: ({ row }) => <div>{row.original.email || "-"}</div>,
    },
    {
      accessorKey: "phone",
      header: t("Phone"),
      cell: ({ row }) => <div>{row.original.phone || "-"}</div>,
    },
    {
      accessorKey: "tax_exempt",
      header: t("Tax Status"),
      cell: ({ row }) => (
        <div>
          {row.original.tax_exempt ? (
            <Badge variant="outline" className="flex items-center gap-1 w-max">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              {t("Tax Exempt")}
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1 w-max">
              <XCircle className="h-3.5 w-3.5 text-gray-400" />
              {t("Taxable")}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewCustomerDetails(row.original)}
          >
            <User className="h-4 w-4" />
            <span className="sr-only">{t("View")}</span>
          </Button>

          <PermissionGuard
            userRole={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]}
            permission={Permission.EDIT_CUSTOMERS}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editCustomer(row.original)}
            >
              {t("Edit")}
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode("details");
  };

  const editCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditOpen(true);
  };

  const handleAddNewClick = () => {
    setIsAddOpen(true);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCustomer(undefined);
  };

  const handleCustomerSuccess = () => {
    refetch();
  };

  useEffect(() => {});

  return (
    <div className="container mx-auto p-6 space-y-6">
      {viewMode === "list" ? (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <h1 className="text-2xl font-bold">{t("Customers")}</h1>
            </div>
            <PermissionGuard
              userRole={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]}
              permission={Permission.CREATE_CUSTOMER}
            >
              <Button onClick={handleAddNewClick}>
                <UserPlus className="h-4 w-4 mr-2" />
                {t("Add New Customer")}
              </Button>
            </PermissionGuard>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>{t("Loading customers")}...</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={customers || []}
              filterColumn="name"
              filterPlaceholder={t("Search customers")+"..."}
              className="neon-border"
            />
          )}
        </>
      ) : (
        selectedCustomer && (
          <CustomerDetails
            customer={selectedCustomer}
            onBack={handleBackToList}
            onEdit={() => editCustomer(selectedCustomer)}
          />
        )
      )}

      {/* Add New Customer Dialog */}
      <CustomerDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={handleCustomerSuccess}
      />

      {/* Edit Customer Dialog */}
      <CustomerDialog
        customer={selectedCustomer}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleCustomerSuccess}
      />
    </div>
  );
}
