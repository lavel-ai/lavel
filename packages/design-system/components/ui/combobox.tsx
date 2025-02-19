'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "./command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./popover"
import { Badge } from "./badge"

interface ComboboxProps<T> {
    isLoading: boolean;
    items: T[];
    onSelect: (value: string) => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    displayKey: keyof T;
    valueKey: keyof T;
    placeholder: string;
    noResultsMessage: string;
    label?: string;
    initialValue?: string;
    createOption?: React.ReactNode;
}

function Combobox<T extends Record<string, any>>({
    isLoading,
    items,
    onSelect,
    searchTerm,
    setSearchTerm,
    displayKey,
    valueKey,
    placeholder,
    noResultsMessage,
    label,
    initialValue,
    createOption,
}: ComboboxProps<T>) {

    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(initialValue || "")

    React.useEffect(() => {
        if (initialValue) {
            setValue(initialValue);
        }
    }, [initialValue]);

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
                        ? items.find((item) => item[valueKey] === value)?.[displayKey] || value
                        : (label ? `Select ${label}...` : placeholder)}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput
                        placeholder={placeholder}
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        disabled={isLoading}
                        className="h-9"
                    />
                    <CommandEmpty>
                        {isLoading ? (
                            <div className="py-6 text-center text-sm">Loading...</div>
                        ) : (
                            noResultsMessage
                        )}
                    </CommandEmpty>
                    <CommandGroup>
                        {items.map((item) => (
                            <CommandItem
                                key={item[valueKey]}
                                onSelect={() => {
                                    const newValue = item[valueKey] === value ? "" : item[valueKey];
                                    setValue(newValue)
                                    onSelect(newValue)
                                    setOpen(false)
                                }}
                            >
                                {item[displayKey]}
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        item[valueKey] === value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                        ))}
                        {createOption && (
                            <CommandItem onSelect={() => setOpen(false)}>
                                {createOption}
                            </CommandItem>
                        )}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export { Combobox }; 