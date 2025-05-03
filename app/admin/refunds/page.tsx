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

import { Search, RefreshCw } from "lucide-react";
import { Refund, Register, Sale } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useRefunds } from "@/lib/refund-service";
import { RefundDataTable } from "@/components/refund/RefundDataTable";

export default function Refunds() {
  const t = useTranslations();
  const { toast } = useToast();
  const { data: refunds = [], isLoading, refetch } = useRefunds();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleRefresh = () => {
    refetch();
    toast({
      title: t("Refreshed"),
      description: t("requests list has been refreshed"),
    });
  };

  const filteredRegisters: (Refund & { sale: Sale })[] = Array.isArray(refunds)
    ? refunds.filter((refund) =>
        refund?.sale?.saleNumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("Refund Requests")}</h1>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title={t("Refresh refund requests")}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("Filter Refund requests")}</CardTitle>
                <CardDescription>
                  {t("Search for refunds by sale number")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={t("Search refunds") + "..."}
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
                <CardTitle>{t("Refunds Stats")}</CardTitle>
                <CardDescription>
                  {t("Quick overview of refunds requests")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("Total Refunds requests")}
                    </span>
                    <span className="font-medium">
                      {(refunds as Refund[]).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("Pending Refunds")}
                    </span>
                    <span className="font-medium">
                      {
                        (refunds as Refund[]).filter(
                          (d) => d.status === "PENDING"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("Approved Refunds")}
                    </span>
                    <span className="font-medium">
                      {
                        (refunds as Refund[]).filter(
                          (d) => d.status === "COMPLETED"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("Rejected Refunds")}
                    </span>
                    <span className="font-medium">
                      {
                        (refunds as Refund[]).filter(
                          (d) => d.status === "DECLINED"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("Canceled Refunds")}
                    </span>
                    <span className="font-medium">
                      {
                        (refunds as Refund[]).filter(
                          (d) => d.status === "CANCELLED"
                        ).length
                      }
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
                  <CardTitle>{t("All refund requests")}</CardTitle>
                  <CardDescription>
                    {isLoading
                      ? t("Loading requests") + "..."
                      : `${t("Showing")} ${filteredRegisters.length} ${t(
                          "of"
                        )} ${(refunds as Refund[]).length} ${t("requests")}`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <RefundDataTable />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Register Dialog */}
      {/* <RegisterDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="create"
      /> */}
    </div>
  );
}
