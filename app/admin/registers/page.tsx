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
import { RegisterDialog } from "@/components/register/RegisterDialog";
import { RegisterDataTable } from "@/components/register/RegisterDataTable";
import { Register } from "@prisma/client";
import { useRegisters } from "@/lib/registers-service";

export default function Registers() {
  const { toast } = useToast();
  const { data: registers = [], isLoading, refetch } = useRegisters();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Registers list has been refreshed",
    });
  };

  const filteredRegisters = (registers as Register[]).filter((register) =>
    register.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Register Devices</h1>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title="Refresh registers"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filter Registers</CardTitle>
                <CardDescription>Search for registers by name</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search register..."
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
                <CardTitle>Register Stats</CardTitle>
                <CardDescription>Quick overview of registers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Registers
                    </span>
                    <span className="font-medium">{(registers as Register[]).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Opened Registers
                    </span>
                    <span className="font-medium">
                      {(registers as Register[]).filter((d) => d.status === 'OPEN').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Closed Registers
                    </span>
                    <span className="font-medium">
                      {(registers as Register[]).filter((d) => d.status === 'CLOSED').length}
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
                  <CardTitle>All Registers</CardTitle>
                  <CardDescription>
                    {isLoading
                      ? "Loading registers..."
                      : `Showing ${filteredRegisters.length} of ${(registers as Register[]).length} registers`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <RegisterDataTable />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Register Dialog */}
      <RegisterDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="create"
      />
    </div>
  );
}

