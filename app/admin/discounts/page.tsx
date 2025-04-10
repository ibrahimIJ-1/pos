"use client";

import { useState } from "react";
import { useBranches, useDiscounts } from "@/lib/pos-service";
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
import { DiscountDialog } from "@/components/discount/DiscountDialog";
import { DiscountDataTable } from "@/components/discount/DiscountDataTable";
import { Branch } from "@prisma/client";

export default function Discounts() {
  const { toast } = useToast();
  const { data: discounts = [], isLoading, refetch } = useDiscounts();
  const { data: branches = [], isLoading: isBranchLoading } = useBranches();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Discounts list has been refreshed",
    });
  };

  const filteredDiscounts = discounts.filter(
    (discount) =>
      discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (discount.code &&
        discount.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Discounts & Promotions</h1>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title="Refresh discounts"
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
                Add Discount
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filter Discounts</CardTitle>
                <CardDescription>
                  Search for discounts by name or code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search discounts..."
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
                <CardTitle>Discount Stats</CardTitle>
                <CardDescription>Quick overview of discounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Discounts
                    </span>
                    <span className="font-medium">{discounts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Active Discounts
                    </span>
                    <span className="font-medium">
                      {discounts.filter((d) => d.isActive).length}
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
                  <CardTitle>All Discounts</CardTitle>
                  <CardDescription>
                    {isLoading
                      ? "Loading discounts..."
                      : `Showing ${filteredDiscounts.length} of ${discounts.length} discounts`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <DiscountDataTable branches={branches as unknown as Branch[]}/>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Discount Dialog */}
      <DiscountDialog
        branches={branches as unknown as Branch[]}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="create"
      />
    </div>
  );
}
