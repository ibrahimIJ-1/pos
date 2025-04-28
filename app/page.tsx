"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatabaseInitializer } from "@/components/DatabaseInitializer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSettingByName } from "@/actions/settings/get-setting-by-name";
import { useTranslations } from "next-intl";

export default function Index() {
  const t = useTranslations();
  const [isInitilized, setIsInitilized] = useState(true);
  const checker = useMutation<
    | Error
    | {
        id: string;
        created_at: Date;
        updated_at: Date;
        key: string;
        value: string;
        category: string;
      },
    Error, // Adjusted the error type to match
    string
  >({
    mutationFn: getSettingByName,
    onSuccess: (data: any) => {
      setIsInitilized(data.value == "1");
    },
    onError: (error) => {
      toast.error(`Failed to check database initialization`);
    },
  });

  const handleStart = async () => {
    checker.mutate("DB_INITIALIZED");
  };

  useEffect(() => {
    handleStart();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-900">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Flash POS
          </CardTitle>
          <CardDescription>
            {t("Point of Sale and Admin System")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Link href="/auth/login">
              <Button size="lg" className="w-full">
                {t("Login")}
              </Button>
            </Link>
            {/* <Link href="/auth/register">
              <Button variant="outline" size="lg" className="w-full">
                Register
              </Button>
            </Link> */}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex justify-between w-full">
            <Link href="/admin">
              <Button variant="ghost">{t('Admin Panel')}</Button>
            </Link>
            <Link href="/pos">
              <Button variant="ghost">{t('POS System')}</Button>
            </Link>
          </div>
          {!isInitilized && !checker.isPending && <DatabaseInitializer />}
        </CardFooter>
      </Card>
    </div>
  );
}
