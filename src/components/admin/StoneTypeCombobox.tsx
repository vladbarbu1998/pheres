import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAllStoneTypes } from "@/hooks/useAdmin";

interface StoneTypeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function StoneTypeCombobox({
  value,
  onChange,
  placeholder = "Select stone type...",
}: StoneTypeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: stoneTypes = [], isLoading } = useAllStoneTypes();

  // Normalize for comparison
  const normalizedSearch = search.trim().toLowerCase();

  // Check if the search term matches an existing option
  const exactMatch = stoneTypes.some(
    (type) => type.toLowerCase() === normalizedSearch
  );

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!normalizedSearch) return stoneTypes;
    return stoneTypes.filter((type) =>
      type.toLowerCase().includes(normalizedSearch)
    );
  }, [stoneTypes, normalizedSearch]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
    setSearch("");
  };

  const handleCreateNew = () => {
    const newValue = search.trim();
    if (newValue) {
      onChange(newValue);
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 z-50" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or create..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                {filteredOptions.length === 0 && !search.trim() && (
                  <CommandEmpty>No stone types yet.</CommandEmpty>
                )}
                
                {filteredOptions.length > 0 && (
                  <CommandGroup>
                    {filteredOptions.map((type) => (
                      <CommandItem
                        key={type}
                        value={type}
                        onSelect={() => handleSelect(type)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === type ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {type}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Show "Create new" option if search doesn't match existing */}
                {search.trim() && !exactMatch && (
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleCreateNew}
                      className="text-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create "{search.trim()}"
                    </CommandItem>
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
