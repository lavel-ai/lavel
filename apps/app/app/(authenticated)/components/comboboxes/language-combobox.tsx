import * as React from "react";
import { Check, ChevronsUpDown, Flag } from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@repo/design-system/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";

const languages = [
  { value: "es", label: "Español", flag: "🇲🇽" },
  { value: "en", label: "Inglés", flag: "🇺🇸" },
  { value: "fr", label: "Frances", flag: "🇫🇷" },
  { value: "de", label: "Aleman", flag: "🇩🇪"},
  { value: "it", label: "Italiano", flag: ""  },
  { value: "pt", label: "Português" },
] as const;

export type LanguageCode = typeof languages[number]["value"];

interface LanguageComboboxProps {
  onSelect: (value: LanguageCode) => void;
  defaultValue?: LanguageCode;
}

export function LanguageCombobox({ onSelect, defaultValue = "es" }: LanguageComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<LanguageCode>(defaultValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? languages.find((language) => language.value === value)?.label
            : "Seleccionar idioma..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar idioma..." />
          <CommandEmpty>No se encontró el idioma.</CommandEmpty>
          <CommandGroup>
            {languages.map((language) => (
              <CommandItem
                key={language.value}
                value={language.value}
                onSelect={(currentValue) => {
                  const selectedValue = currentValue as LanguageCode;
                  setValue(selectedValue);
                  onSelect(selectedValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === language.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {language.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 