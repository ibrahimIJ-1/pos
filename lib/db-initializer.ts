import { initDatabase } from "@/actions/initialize-database";
import { toast } from "sonner";

export const initializeDatabase = async () => {
  try {
    // Remove the duplicate toast.loading since it's also shown in the component
    await initDatabase();
    toast.success("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    const errorMessage = "Failed to initialize database";
    toast.error(errorMessage);
    throw error;
  }
};
