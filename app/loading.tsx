import { Loader2Icon } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-900">
      <div className="flex flex-col items-center">
        <Loader2Icon size={30} className="animate-spin stroke-primary" />
        <p className="text-white text-lg mt-4">Loading...</p>
      </div>
    </div>
  );
}
