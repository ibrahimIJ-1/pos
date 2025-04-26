import { useTranslations } from "next-intl";
import { z } from "zod";

export const discountFormSchema = () => {
  const t = useTranslations();
  return z.object({
    name: z
      .string()
      .min(3, { message: t("Name must be at least 3 characters") }),
    code: z.string().optional(),
    type: z.enum(["PERCENTAGE", "FIXED", "BUY_X_GET_Y"]),
    value: z.coerce
      .number()
      .min(0, { message: t("Value must be positive") })
      .refine((val) => val <= 100 || val === 0, {
        message: t("Percentage cannot exceed 100%"),
        path: ["value"],
      }),
    minPurchaseAmount: z.coerce.number().optional(),
    appliesTo: z.enum([
      "ENTIRE_ORDER",
      "SPECIFIC_PRODUCTS",
      "SPECIFIC_CATEGORIES",
    ]),
    productIds: z.array(z.string()).optional(),
    categoryIds: z.array(z.string()).optional(),
    buyXQuantity: z.coerce.number().optional(),
    getYQuantity: z.coerce.number().optional(),
    startDate: z.date(),
    endDate: z.date().optional(),
    maxUses: z.coerce.number().optional(),
    isActive: z.boolean(),
    branches: z
      .array(z.string())
      .min(1, t("At least one branch must be selected")),
  });
};
