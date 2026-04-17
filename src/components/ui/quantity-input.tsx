"use client";

import { useState, useEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm";
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
  size = "default",
}: QuantityInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow empty string for typing, and only digits
    if (newValue === "" || /^\d+$/.test(newValue)) {
      setInputValue(newValue);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < min) {
      setInputValue(min.toString());
      onChange(min);
    } else if (parsed > max) {
      setInputValue(max.toString());
      onChange(max);
    } else if (parsed !== value) {
      onChange(parsed);
    } else {
      // Reset to current value if nothing changed
      setInputValue(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    }
  };

  const isSmall = size === "sm";
  const buttonSize = isSmall ? "h-8 w-8" : "h-10 w-10";
  const inputSize = isSmall ? "h-8 w-12" : "h-10 w-14";

  return (
    <div className={cn("flex items-center", className)} data-testid="quantity-input">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(buttonSize, "rounded-r-none border-r-0 shrink-0")}
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        data-testid="quantity-decrement"
      >
        <Minus className={cn(isSmall ? "h-3 w-3" : "h-4 w-4")} />
      </Button>
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          inputSize,
          "rounded-none text-center font-medium tabular-nums px-1 border-x-0",
          "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
        )}
        aria-label="Quantity"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(buttonSize, "rounded-l-none border-l-0 shrink-0")}
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        data-testid="quantity-increment"
      >
        <Plus className={cn(isSmall ? "h-3 w-3" : "h-4 w-4")} />
      </Button>
    </div>
  );
}