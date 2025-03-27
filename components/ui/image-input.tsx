
import * as React from "react";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageInputProps {
  onChange: (files: File[]) => void;
  value: File[];
  className?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeInMB?: number;
}

export function ImageInput({
  onChange,
  value = [],
  className,
  multiple = false,
  maxFiles = 5,
  maxSizeInMB = 5,
}: ImageInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [previews, setPreviews] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Generate image previews
    const urls = value.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    // Cleanup
    return () => {
      urls.forEach(URL.revokeObjectURL);
    };
  }, [value]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    // Convert FileList to array
    const fileArray = Array.from(files);
    
    // Check file type
    const invalidFiles = fileArray.filter(
      (file) => !file.type.startsWith("image/")
    );
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Error",
        description: "Please upload only image files.",
        variant: "destructive",
      });
      return;
    }

    // Check max files
    if (multiple && fileArray.length + value.length > maxFiles) {
      toast({
        title: "Error",
        description: `You can only upload a maximum of ${maxFiles} images.`,
        variant: "destructive",
      });
      return;
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    const oversizedFiles = fileArray.filter((file) => file.size > maxSizeInBytes);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "Error",
        description: `Some images exceed the maximum size of ${maxSizeInMB}MB.`,
        variant: "destructive",
      });
      return;
    }

    // Update files
    const newFiles = multiple ? [...value, ...fileArray] : fileArray;
    onChange(newFiles);
    
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors neon-input",
          "flex flex-col items-center justify-center gap-2"
        )}
        onClick={handleClick}
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          {multiple ? `Up to ${maxFiles} images` : "Single image"}, max {maxSizeInMB}MB each
        </p>
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple={multiple}
          accept="image/*"
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, i) => (
            <div
              key={preview}
              className="relative aspect-square rounded-md overflow-hidden group"
            >
              <img
                src={preview}
                alt={`Preview ${i}`}
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
