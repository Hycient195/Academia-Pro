"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export interface MultiSelectOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (optionValue: string, checked: boolean) => {
    const newValue = checked
      ? [...value, optionValue]
      : value.filter((v) => v !== optionValue)
    onChange(newValue)
  }

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue))
  }

  const selectedOptions = options.filter((option) => value.includes(option.value))

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full justify-between",
            selectedOptions.length > 0 && "h-auto p-2",
            disabled && "cursor-not-allowed opacity-50"
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(option.value)
                  }}
                >
                  {option.icon && <option.icon className="mr-1 h-3 w-3" />}
                  {option.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <span className="text-muted-foreground">▼</span>
        </Button>

        {isOpen && (
          <div className="absolute top-full z-50 w-full mt-1 rounded-md border bg-popover p-2 shadow-md max-h-48 overflow-y-auto">
            {options.map((option) => {
              const isSelected = value.includes(option.value)
              return (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                  onClick={() => handleSelect(option.value, !isSelected)}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => {}}
                    className="pointer-events-none"
                  />
                  {option.icon && <option.icon className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm">{option.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}