
import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileInputProps {
  onChange: (files: File[]) => void;
  value: File[];
  className?: string;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSizeInMB?: number;
}

export function FileInput({
  onChange,
  value = [],
  className,
  multiple = false,
  accept = "",
  maxFiles = 5,
  maxSizeInMB = 5,
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    // Convert FileList to array
    const fileArray = Array.from(files);
    
    // Check max files
    if (multiple && fileArray.length + value.length > maxFiles) {
      toast({
        title: "Error",
        description: `You can only upload a maximum of ${maxFiles} files.`,
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
        description: `Some files exceed the maximum size of ${maxSizeInMB}MB.`,
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
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors neon-input",
          "flex flex-col items-center justify-center gap-2"
        )}
        onClick={handleClick}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          {multiple ? `Up to ${maxFiles} files` : "Single file"}, max {maxSizeInMB}MB each
        </p>
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple={multiple}
          accept={accept}
        />
      </div>

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between p-2 rounded-md bg-secondary"
            >
              <span className="text-sm truncate max-w-[250px]">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
