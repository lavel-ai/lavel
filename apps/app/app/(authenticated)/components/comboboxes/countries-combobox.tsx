"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@repo/design-system/lib/utils"
import { Button } from "@repo/design-system/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@repo/design-system/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/design-system/components/ui/popover"
import useResizeObserver from "use-resize-observer"

interface Country {
  name: string
  code: string
  flag: string
}

export function CountryCombobox() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [countries, setCountries] = React.useState<Country[]>([])
  const [maxPopoverHeight, setMaxPopoverHeight] = React.useState<number | undefined>(undefined)
  const { ref: popoverTriggerRef } = useResizeObserver<HTMLButtonElement>({
    onResize: ({ height }) => {
      setMaxPopoverHeight(window.innerHeight - (height || 0) - 20)
    },
  })

  React.useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags")
      .then((res) => res.json())
      .then((data) => {
        const formattedCountries = data.map((country: any) => ({
          name: country.name.common,
          code: country.cca2,
          flag: country.flags.svg,
        }))
        setCountries(formattedCountries)
      })
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
          ref={popoverTriggerRef}
        >
          {value ? countries.find((country) => country.code === value)?.name : "Select country..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0"
        style={{ maxHeight: maxPopoverHeight, overflowY: 'auto' }}
      >
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.code}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === country.code ? "opacity-100" : "opacity-0")} />
                  <img
                    src={country.flag || "/placeholder.svg"}
                    alt={`${country.name} flag`}
                    className="mr-2 h-4 w-6 object-cover"
                  />
                  {country.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

