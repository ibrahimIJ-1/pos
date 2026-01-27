"use client";

import React, { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncPull, syncPush } from "@/lib/sync-engine";
import { toast } from "sonner";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor unsynced sales count
  const unsyncedCount = useLiveQuery(() =>
    db.sales.where("synced").equals(0).count(),
  );
  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);
    if (navigator.onLine) {
      handleSync();
    }

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back Online! Syncing...", { id: "network-status" });
      handleSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are Offline. Changes will be saved locally.", {
        id: "network-status",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []); // Run once on mount

  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline");
      return;
    }
    setIsSyncing(true);
    try {
      await syncPush();
      await syncPull();
      toast.success("Sync Completed");
    } catch (e) {
      console.error(e);
      toast.error("Sync Failed");
    } finally {
      setIsSyncing(false);
    }
  };

  if (
    isOnline &&
    (unsyncedCount === 0 || unsyncedCount === undefined) &&
    !isSyncing
  ) {
    return null; // Don't show anything if everything is fine and online
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Offline</span>
        </div>
      )}

      {/* Unsynced Data Indicator */}
      {isOnline && (unsyncedCount || 0) > 0 && (
        <div className="bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
          <span className="text-sm font-medium">
            {unsyncedCount} Unsynced Sales
          </span>
        </div>
      )}

      {/* Sync Button */}
      {isOnline && (
        <Button
          size="sm"
          variant="secondary"
          className="shadow-lg rounded-full h-8 w-8 p-0"
          onClick={handleSync}
          disabled={isSyncing}
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
        </Button>
      )}
    </div>
  );
}
