
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  min?: number;
  max?: number;
  step?: number;
  value: number | undefined;
  onChange?: (value: number) => void;
  onValueChange?: (value: number) => void;  // Add this alternative prop name
  showControls?: boolean;
  className?: string;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value,
      onChange,
      onValueChange,
      showControls = true,
      className,
      ...props
    },
    ref
  ) => {
    // Use either onChange or onValueChange (for compatibility)
    const handleValueChange = onChange || onValueChange;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      if (isNaN(newValue)) return;
      
      const clampedValue = Math.min(Math.max(newValue, min), max);
      if (handleValueChange) {
        handleValueChange(clampedValue);
      }
    };

    const increment = () => {
      const newValue = (value??0) + step;
      if (newValue <= max && handleValueChange) {
        handleValueChange(newValue);
      }
    };

    const decrement = () => {
      const newValue = (value??0) - step;
      if (newValue >= min && handleValueChange) {
        handleValueChange(newValue);
      }
    };

    return (
      <div className={cn("flex", className)}>
        {showControls && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-r-none"
            onClick={decrement}
            disabled={(value??0) <= min}
          >
            <MinusIcon className="h-4 w-4" />
          </Button>
        )}
        <Input
          type="number"
          ref={ref}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={cn(
            showControls && "rounded-none text-center",
            "neon-input transition-shadow duration-300"
          )}
          {...props}
        />
        {showControls && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-l-none"
            onClick={increment}
            disabled={(value??0) >= max}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";
