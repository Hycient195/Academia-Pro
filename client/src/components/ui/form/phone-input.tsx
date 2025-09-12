"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "../input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select"

export interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
}

export const countries: Country[] = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰" },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭" },
  { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", dialCode: "+256", flag: "🇺🇬" },
  { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼" },
  { code: "ET", name: "Ethiopia", dialCode: "+251", flag: "🇪🇹" },
  { code: "MA", name: "Morocco", dialCode: "+212", flag: "🇲🇦" },
  { code: "TN", name: "Tunisia", dialCode: "+216", flag: "🇹🇳" },
  { code: "DZ", name: "Algeria", dialCode: "+213", flag: "🇩🇿" },
  { code: "LY", name: "Libya", dialCode: "+218", flag: "🇱🇾" },
  { code: "SD", name: "Sudan", dialCode: "+249", flag: "🇸🇩" },
  { code: "SS", name: "South Sudan", dialCode: "+211", flag: "🇸🇸" },
  { code: "BJ", name: "Benin", dialCode: "+229", flag: "🇧🇯" },
  { code: "BF", name: "Burkina Faso", dialCode: "+226", flag: "🇧🇫" },
  { code: "CI", name: "Ivory Coast", dialCode: "+225", flag: "🇨🇮" },
  { code: "CV", name: "Cape Verde", dialCode: "+238", flag: "🇨🇻" },
  { code: "GM", name: "Gambia", dialCode: "+220", flag: "🇬🇲" },
  { code: "GN", name: "Guinea", dialCode: "+224", flag: "🇬🇳" },
  { code: "GW", name: "Guinea-Bissau", dialCode: "+245", flag: "🇬🇼" },
  { code: "LR", name: "Liberia", dialCode: "+231", flag: "🇱🇷" },
  { code: "ML", name: "Mali", dialCode: "+223", flag: "🇲🇱" },
  { code: "MR", name: "Mauritania", dialCode: "+222", flag: "🇲🇷" },
  { code: "NE", name: "Niger", dialCode: "+227", flag: "🇳🇪" },
  { code: "SN", name: "Senegal", dialCode: "+221", flag: "🇸🇳" },
  { code: "SL", name: "Sierra Leone", dialCode: "+232", flag: "🇸🇱" },
  { code: "TG", name: "Togo", dialCode: "+228", flag: "🇹🇬" },
]

export interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  defaultCountry?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  size?: "sm" | "default"
}

function PhoneInput({
  value,
  onChange,
  defaultCountry = "US",
  placeholder = "Enter phone number",
  disabled = false,
  className,
  size = "default",
  ...props
}: PhoneInputProps & Omit<React.ComponentProps<"div">, keyof PhoneInputProps>) {
  // Parse country and phone number from the value string
  const parsePhoneValue = (phoneValue: string) => {
    if (!phoneValue) return { country: countries.find(c => c.code === defaultCountry) || countries[0], phoneNumber: "" }

    // Find country by dial code
    const country = countries.find(c => phoneValue.startsWith(c.dialCode))
    if (country) {
      return {
        country,
        phoneNumber: phoneValue.replace(country.dialCode, "").trim()
      }
    }

    // Fallback to default country
    return {
      country: countries.find(c => c.code === defaultCountry) || countries[0],
      phoneNumber: phoneValue
    }
  }

  const [selectedCountry, setSelectedCountry] = React.useState<Country>(() =>
    value ? parsePhoneValue(value).country : countries.find(c => c.code === defaultCountry) || countries[0]
  )
  const [phoneNumber, setPhoneNumber] = React.useState<string>(() =>
    value ? parsePhoneValue(value).phoneNumber : ""
  )

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      const parsed = parsePhoneValue(value)
      setSelectedCountry(parsed.country)
      setPhoneNumber(parsed.phoneNumber)
    }
  }, [value])

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    if (country) {
      setSelectedCountry(country)
      const newValue = `${country.dialCode}${phoneNumber}`
      onChange?.(newValue)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value.replace(/\D/g, "") // Only allow digits
    setPhoneNumber(newPhoneNumber)
    const newValue = `${selectedCountry.dialCode}${newPhoneNumber}`
    onChange?.(newValue)
  }

  return (
    <div
      className={cn(
        "flex items-center gap-0 rounded-md border border-input bg-transparent shadow-xs",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        disabled && "cursor-not-allowed opacity-50",
        size === "sm" ? "h-8" : "h-9",
        className
      )}
      {...props}
    >
      <Select
        value={selectedCountry.code}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "h-full w-fit min-w-[120px] rounded-r-none border-0 border-r border-input bg-transparent px-3 shadow-none focus:ring-0 focus:ring-offset-0",
            size === "sm" ? "h-8 text-xs" : "h-9"
          )}
        >
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-base">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-2">
                <span className="text-base">{country.flag}</span>
                <span className="text-sm">{country.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {country.dialCode}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneChange}
        disabled={disabled}
        className={cn(
          "h-full flex-1 rounded-l-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
          size === "sm" ? "h-8 text-xs" : "h-9"
        )}
      />
    </div>
  )
}

export { PhoneInput }