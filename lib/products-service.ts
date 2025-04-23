import { getAllProducts } from "@/actions/products/get-all-products";
import { createNewProduct } from "@/actions/products/create-product";
import { updateProduct } from "@/actions/products/update-product";
import { deleteProduct } from "@/actions/products/delete-product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllPOSProducts } from "@/actions/products/get-all-pos-products";
import { toast } from "sonner";
import { getProductsTemplate } from "@/actions/products/get-products-template";
import { uploadProductsFromExcel } from "@/actions/products/upload-product-template";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });
};

// export const useProduct = (id: string) => {
//   return useQuery({
//     queryKey: ["products", id],
//     queryFn: async () => {
//       await delay(300);
//       const product = mockProducts.find((p) => p.id === id);
//       if (!product) throw new Error("Product not found");
//       return product;
//     },
//     enabled: !!id,
//   });
// };

export const usePOSProducts = () => {
  return useQuery({
    queryKey: ["pos-products"],
    queryFn: getAllPOSProducts,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProduct: any) => {
      const product: any = await createNewProduct(newProduct);
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to create product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useGetProductsTemplate = () => {
  return useMutation({
    mutationFn: getProductsTemplate,
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Create download link
        const link = document.createElement("a");
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${data.data}`;
        link.download = "products_template.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Template downloaded successfully");
      } else {
        toast.error(data.error || "Failed to download template");
      }
    },
    onError: () => {
      toast.error("Failed to download template");
    },
  });
};

export const useUploadProductsTemplate = () => {
  return useMutation({
    mutationFn: (formData: FormData) => uploadProductsFromExcel(formData),
    onSuccess: (data) => {
      if (data!.success) {
        toast.success(data!.message || "Products imported successfully");
      } else {
        toast.error(data!.error || "Failed to import products");
      }
    },
    onError: () => {
      toast.error("Failed to import products");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", data.id] });
      toast.success("Product updated successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to update product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to delete product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};
