"use client";

import { useState } from "react";
import { useBranches } from "@/lib/pos-service";
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
import { BranchDialog } from "@/components/branch/BranchDialog";
import { BranchDataTable } from "@/components/branch/BranchDataTable";
import { Branch } from "@prisma/client";

export default function Branches() {
  const { toast } = useToast();
  const { data: branches = [], isLoading, refetch } = useBranches();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Branches list has been refreshed",
    });
  };

  const filteredBranches = (branches).filter((branch) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Branch Devices</h1>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title="Refresh branches"
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
                Add Branch
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filter Branches</CardTitle>
                <CardDescription>Search for branches by name</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search branch..."
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
                <CardTitle>Branch Stats</CardTitle>
                <CardDescription>Quick overview of branches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Branches
                    </span>
                    <span className="font-medium">{branches.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Opened Branches
                    </span>
                    <span className="font-medium">
                      {branches.filter((d) => d.isActive === true).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Closed Branches
                    </span>
                    <span className="font-medium">
                      {branches.filter((d) => d.isActive === false).length}
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
                  <CardTitle>All Branches</CardTitle>
                  <CardDescription>
                    {isLoading
                      ? "Loading branches..."
                      : `Showing ${filteredBranches.length} of ${branches.length} branches`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <BranchDataTable />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Branch Dialog */}
      <BranchDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="create"
      />
    </div>
  );
}

