"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface FilterOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  value: string
  onValueChange: (value: string) => void
  options: FilterOption[]
  placeholder?: string
  className?: string
  renderValue?: (value: string) => React.ReactNode
}

function FilterDropdown({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
  renderValue,
}: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "justify-between gap-1.5 font-normal data-[size=default]:h-8 overflow-hidden",
              !selected && "text-muted-foreground",
              className
            )}
          >
            <span className="truncate min-w-0">
              {selected
                ? renderValue
                  ? renderValue(value)
                  : selected.label
                : placeholder}
            </span>
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-max min-w-[var(--anchor-width)] p-1"
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              onValueChange(option.value)
              setOpen(false)
            }}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground",
              option.value === value && "bg-accent text-accent-foreground"
            )}
          >
            <span className="flex-1 text-left">{option.label}</span>
            {option.value === value && (
              <CheckIcon className="size-4 shrink-0" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

export { FilterDropdown }
export type { FilterDropdownProps, FilterOption }
