"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/app/loading";
import MacNotFound from "@/app/mac-not-found";

import { useSetting } from "@/lib/settings-service";
import { SystemContextType } from "./context-types/SystemContextType";

export const SystemContext = createContext<SystemContextType | undefined>(
  undefined
);

export function SystemProvider({ children }: { children: ReactNode }) {
  const { data: storeCurrencyQuery, isLoading: storeCurrencyLoading } =
    useSetting("currency",true);
  const { data: nearestValueQuery, isLoading: nearestValueLoading } =
    useSetting("nearestValue",true);

  const [storeNearestAmount, setStoreNearestAmount] = useState<number>(0);
  const [storeCurrency, setStoreCurrency] = useState<string>("IQD");

  useEffect(() => {
    if (storeCurrencyQuery) {
      setStoreCurrency(storeCurrencyQuery?.value);
    }
    if (nearestValueQuery) {
      setStoreNearestAmount(Number(nearestValueQuery?.value));
    }
  }, []);

  const { macAddress, macLoading } = useAuth();

  return (
    <SystemContext.Provider
      value={{
        storeCurrency,
        storeNearestAmount,
      }}
    >
      {macLoading || storeCurrencyLoading || nearestValueLoading ? (
        <Loading />
      ) : !macAddress ? (
        <MacNotFound />
      ) : (
        children
      )}
    </SystemContext.Provider>
  );
}

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error("useSystem must be used within an refundProvider");
  }
  return context;
};
