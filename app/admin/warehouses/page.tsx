"use client";

import { useState } from "react";
import { UserRole, Permission } from "@/lib/permissions";
import { PermissionGuard } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Plus, Search, RefreshCw } from "lucide-react";

import { useTranslations } from "next-intl";
import { useWarehouses } from "@/lib/warehouses-service";
import { WarehouseDialog } from "@/components/warehouse/WarehouseDialog";
import { WarehouseDataTable } from "@/components/warehouse/WarehouseDataTable";

export default function Warehouses() {
  const t = useTranslations()
  const { toast } = useToast();
  const { data: warehouses = [], isLoading, refetch } = useWarehouses();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleRefresh = () => {
    refetch();
    toast({
      title: t("Refreshed"),
      description: t("Warehouses list has been refreshed"),
    });
  };

  const filteredWarehouses = (warehouses).filter((warehouse) =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("Warehouse Devices")}</h1>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title={t("Refresh warehouses")}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <PermissionGuard
              userRole={UserRole.MANAGER}
              permission={Permission.CREATE_DISCOUNT}
            >
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("Add Warehouse")}
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("Filter Warehouses")}</CardTitle>
                <CardDescription>{t("Search for warehouses by name")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={t("Search warehouse")+"..."}
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Warehouse Stats")}</CardTitle>
                <CardDescription>{t("Quick overview of warehouses")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("Total Warehouses")}
                    </span>
                    <span className="font-medium">{warehouses.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("Opened Warehouses")}
                    </span>
                    <span className="font-medium">
                      {warehouses.filter((d) => d.isActive === true).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("Closed Warehouses")}
                    </span>
                    <span className="font-medium">
                      {warehouses.filter((d) => d.isActive === false).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("All Warehouses")}</CardTitle>
                  <CardDescription>
                    {isLoading
                      ? t("Loading warehouses")+"..."
                      : `${t("Showing")} ${filteredWarehouses.length} ${t("of")} ${warehouses.length} ${t("warehouses")}`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <WarehouseDataTable />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Warehouse Dialog */}
      <WarehouseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="create"
      />
    </div>
  );
}

