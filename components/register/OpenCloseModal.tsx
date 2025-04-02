import { useCloseRegister, useOpenRegister } from "@/lib/pos-service";
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

const registerSchema = z.object({
  id: z.string().min(3, { message: "Name must be at least 3 characters" }),
  balance: z.number().min(0, { message: "Value must be 0 or more" }),
});

type ToggleFormValues = z.infer<typeof registerSchema>;

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  register: Register;
}
function OpenCloseModal({ open, onOpenChange, register }: RegisterDialogProps) {
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
              title: "Register Switched",
              description: `Register "${register.name}" successfully Switched`,
            });
            onOpenChange(false);
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: `Failed to Switch register: ${
                error instanceof Error ? error.message : "Unknown error"
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
              title: "Register Switched",
              description: `Register "${register.name}" successfully Switched`,
            });
            onOpenChange(false);
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: `Failed to Switch register: ${
                error instanceof Error ? error.message : "Unknown error"
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
          <DialogTitle>
            {register.status === RegisterStatus.OPEN
              ? "Close Register"
              : "Open Register"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-auto p-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem className="px-1">
                      <FormLabel>
                        {register.status === RegisterStatus.OPEN
                          ? "Close"
                          : "Open"}{" "}
                        Balance
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={openRegister.isPending || closeRegister.isPending}
              >
                {register?.status === RegisterStatus.OPEN
                  ? openRegister.isPending
                    ? "Closing..."
                    : "Close Register"
                  : closeRegister.isPending
                  ? "Opening..."
                  : "Open Register"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default OpenCloseModal;
