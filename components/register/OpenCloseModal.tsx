import { Register, RegisterStatus } from "@prisma/client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { NumberInput } from "../ui/number-input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useCloseRegister, useOpenRegister } from "@/lib/registers-service";
import { useTranslations } from "next-intl";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  register: Register;
}
function OpenCloseModal({ open, onOpenChange, register }: RegisterDialogProps) {
  const t = useTranslations();
  const registerSchema = z.object({
    id: z.string().min(3, { message: t("Name must be at least 3 characters") }),
    balance: z.number().min(0, { message: t("Value must be 0 or more") }),
  });

  type ToggleFormValues = z.infer<typeof registerSchema>;
  const openRegister = useOpenRegister();
  const closeRegister = useCloseRegister();

  const form = useForm<ToggleFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      id: register?.id,
      balance: 0,
    },
  });
  const onSubmit = (values: ToggleFormValues) => {
    if (register.status == RegisterStatus.CLOSED) {
      openRegister.mutate(
        {
          id: values.id,
          openingBalance: 0,
        },
        {
          onSuccess: () => {
            toast({
              title: t("Register Switched"),
              description: `${t("Register")} "${register.name}" ${t(
                "successfully Switched"
              )}`,
            });
            onOpenChange(false);
          },
          onError: (error: any) => {
            toast({
              title: t("Error"),
              description: `${t("Failed to Switch register")}: ${
                error instanceof Error ? error.message : t("Unknown error")
              }`,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      closeRegister.mutate(
        {
          id: register.id,
          closingBalance: 0,
        },
        {
          onSuccess: () => {
            toast({
              title: t("Register Switched"),
              description: `${t("Register")} "${register.name}" ${t(
                "successfully Switched"
              )}`,
            });
            onOpenChange(false);
          },
          onError: (error: any) => {
            toast({
              title: t("Error"),
              description: `${t("Failed to Switch register")}: ${
                error instanceof Error ? error.message : t("Unknown error")
              }`,
              variant: "destructive",
            });
          },
        }
      );
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="rtl:text-start">
            {register.status === RegisterStatus.OPEN
              ? t("Close Register")
              : t("Open Register")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-auto p-4" dir={t("dir") as "rtl" | "ltr"}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem className="px-1">
                      <FormLabel>
                        {register.status === RegisterStatus.OPEN
                          ? t("Close")
                          : t("Open")}{" "}
                        {t("Balance")}
                      </FormLabel>
                      <FormControl>
                        <NumberInput min={0} step={0.01} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4"></div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={openRegister.isPending || closeRegister.isPending}
              >
                {register?.status === RegisterStatus.OPEN
                  ? openRegister.isPending
                    ? t("Closing") + "..."
                    : t("Close Register")
                  : closeRegister.isPending
                  ? t("Opening") + "..."
                  : t("Open Register")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default OpenCloseModal;
