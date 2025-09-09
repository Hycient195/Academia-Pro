"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { PhoneInput } from "./phone-input"
import { Country, State } from "country-state-city";
import { PaginatedResponse } from "@academia-pro/types/shared/shared.types";
import { IconX } from "@tabler/icons-react"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

type TElementTypes = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

interface IProps {
  labelText?: string | React.ReactNode
  value?: string | number | boolean
  defaultValue?: string | number | boolean
  options?: { value: string | number; text: string | React.ReactNode }[]
  onChange?: (arg: { target: { value: string | number | boolean; name?: string } } | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
  footerText?: string | React.ReactNode
  footerTextClassName?: string
  errorText?: string
  name?: string
  id?: string
  placeholder?: string
  wrapperClassName?: string
  labelClassName?: string
  inputClassName?: string
  rows?: number
  charactersRemaining?: string | number
  type?: "text" | "password" | "number" | "email" | "date" | "time" | "datetime-local"
  isLoading?: boolean
  disabled?: boolean
  required?: boolean
  style?: React.CSSProperties
  ref?: React.MutableRefObject<TElementTypes> | React.LegacyRef<TElementTypes> | React.RefObject<TElementTypes> | undefined
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  showHintText?: boolean
  inputSize?: "MEDIUM" | "LARGE"
}

interface ISelectProps {
  triggerClassName?: string
  contentClassName?: string
}

// FormSelect Component
export const FormSelect = ({
  labelText,
  errorText,
  footerTextClassName,
  ref,
  defaultValue = "Select Option",
  options,
  onChange,
  footerText,
  name,
  id,
  placeholder,
  value,
  wrapperClassName,
  labelClassName,
  isLoading = false,
  disabled = false,
  icon,
  iconPosition,
  required,
  inputClassName,
  triggerClassName,
  contentClassName,
  showHintText = false,
  inputSize = "MEDIUM"
}: IProps & ISelectProps & React.InputHTMLAttributes<HTMLInputElement>) => {
  const onValueChange = (e: string | number) => {
    if (onChange) onChange({ target: { name, value: e } })
  }

  const handleClearValue = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("fired change")
    if (onChange) onChange({ target: { name, value: "" } })
  }

  const sizeClass = inputSize === "LARGE" ? "!py-4" : "!py-3.5"

  return (
    <label htmlFor={id} className={wrapperClassName}>
      {labelText && (
        <p className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5",
          isLoading && "text-muted-foreground",
          labelClassName
        )}>
          {labelText}
        </p>
      )}
      <div className="relative">
        {showHintText && (
          <span className={cn(
            "absolute top-1.5 left-3.5 lg:left-4.5 text-muted text-[10px] animate-fade-in uppercase z-[1]",
            (showHintText && !value) && "!hidden"
          )}>
            {placeholder}
          </span>
        )}
        <Select
          key={`select-${value || 'empty'}`}
          required={required}
          onValueChange={onValueChange}
          value={value as string || ""}
          name={name}
          disabled={disabled}
        >
          {value && !isLoading && !disabled && (
            <button
              type="button"
              onMouseUp={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleClearValue(e)
              }}
              className="flex absolute top-0 bottom-0 my-auto right-3 items-center justify-center w-4.5 h-4.5 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors ml-2 z-10"
              aria-label="Clear selection"
            >
              <IconX className="!size-3 !stroke-3 !text-slate-500 !font-bold" />
            </button>
          )}
          <SelectTrigger
            ref={ref as React.LegacyRef<HTMLButtonElement>}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              isLoading && "bg-muted animate-pulse",
              sizeClass,
              isLoading && "[&_*]:!invisible",
              !!value ? "!text-foreground [&>svg]:!hidden" : "!text-muted-foreground",
              icon
                ? (iconPosition === "right" ? "!pr-9 !pl-3 lg:!pl-3.5" : "!pl-10 pr-3 lg:pr-3.5")
                : "",
              triggerClassName,
              inputClassName
            )}
          >
            <SelectValue placeholder={placeholder} />
            
          </SelectTrigger>
          <SelectContent className={contentClassName}>
            {options && options.map((option, index: number) => (
              <SelectItem
                key={`${labelText}-${index}`}
                value={option.value as string}
                className="!font-lexend !font-zinc-600 !font-light"
              >
                {option.text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {icon && (
          <span className={cn(
            "absolute top-0 bottom-0 h-max my-auto flex items-center justify-center",
            isLoading && "invisible",
            iconPosition === "right" ? "right-3" : "left-3"
          )}>
            {icon}
          </span>
        )}
      </div>
      {footerText && (
        <p className={cn(
          "text-xs text-muted-foreground mt-1.5",
          footerTextClassName
        )}>
          {footerText}
        </p>
      )}
      {errorText && (
        <p className={cn(
          "text-sm mt-1.5 font-light",
          isLoading ? "text-zinc-300" : "text-red-600"
        )}>
          {errorText}
        </p>
      )}
    </label>
  )
}

// FormCountrySelect Component
interface IFormTextProps extends Omit<IProps, "onChange">, ISelectProps {
  showFlag?: boolean;
  onChange?: (arg: { target: { value: string, name?: string } } | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
}


// FormText Component
export const FormText = ({
  labelText,
  errorText,
  footerTextClassName,
  ref,
  value,
  onChange,
  footerText,
  name,
  id,
  placeholder,
  type = "text",
  wrapperClassName,
  labelClassName,
  inputClassName,
  isLoading = false,
  disabled = false,
  icon,
  required,
  iconPosition,
  inputMode,
  onFocus,
  onBlur,
  showHintText = false,
  inputSize = "MEDIUM"
}: IProps & IFormTextProps & React.InputHTMLAttributes<HTMLInputElement>) => {
  const sizeClass = inputSize === "LARGE" ? "!py-4" : "!py-3.5"

  return (
    <label htmlFor={id} className={wrapperClassName}>
      {labelText && (
        <p className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5",
          isLoading && "text-muted-foreground",
          labelClassName
        )}>
          {labelText}
        </p>
      )}
      <div className="relative">
        {showHintText && (
          <span className={cn(
            "absolute top-1.5 left-3.5 lg:left-4.5 text-muted text-[10px] animate-fade-in uppercase",
            (showHintText && !value) && "!hidden"
          )}>
            {placeholder}
          </span>
        )}
        <input
          value={value}
          ref={ref as React.LegacyRef<HTMLInputElement>}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange && onChange(e)}
          name={name}
          id={id}
          placeholder={!isLoading ? placeholder : ""}
          inputMode={inputMode}
          onFocus={onFocus}
          onBlur={onBlur}
          type={type}
          disabled={isLoading || disabled}
          required={required}
          className={cn(
            "flex h-[2.35rem] w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            isLoading && "bg-muted animate-pulse",
            icon
              ? (iconPosition === "right" ? "pr-9 pl-3 lg:pl-3.5" : "pl-10 pr-3 lg:pr-3.5")
              : "",
            sizeClass,
            inputClassName
          )}
        />
        {icon && (
          <span className={cn(
            "absolute top-0 bottom-0 h-max my-auto flex items-center justify-center",
            isLoading && "invisible",
            iconPosition === "right" ? "right-3" : "left-3",
            inputSize === "LARGE" ? "py-4" : "py-3.5"
          )}>
            {icon}
          </span>
        )}
      </div>
      {footerText && (
        <p className={cn(
          "text-xs text-muted-foreground mt-1.5",
          footerTextClassName
        )}>
          {footerText}
        </p>
      )}
      {errorText && (
        <p className={cn(
          "font-light text-sm mt-1.5",
          isLoading ? "text-zinc-300" : "text-red-600"
        )}>
          {errorText}
        </p>
      )}
    </label>
  )
}

// FormTextArea Component
export const FormTextArea = ({
  labelText,
  errorText,
  footerTextClassName,
  ref,
  value,
  onChange,
  footerText,
  name,
  id,
  placeholder,
  wrapperClassName,
  labelClassName,
  rows = 6,
  inputClassName,
  charactersRemaining,
  isLoading = false,
  disabled = false,
  required,
  showHintText = false
}: IProps & React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <label htmlFor={id} className={wrapperClassName}>
      {labelText && (
        <p className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5",
          isLoading && "text-muted-foreground",
          labelClassName
        )}>
          {labelText}
        </p>
      )}
      <div className="relative">
        <span className={cn(
          "absolute top-1.5 left-3.5 text-muted text-[10px] animate-fade-in uppercase",
          (showHintText && !value) && "!hidden"
        )}>
          {placeholder}
        </span>
        <textarea
          value={value}
          rows={rows}
          ref={ref as React.LegacyRef<HTMLTextAreaElement>}
          onChange={(e) => onChange && onChange(e)}
          name={name}
          id={id}
          placeholder={!isLoading ? placeholder : ""}
          disabled={isLoading || disabled}
          required={required}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            isLoading && "bg-muted animate-pulse",
            "",
            inputClassName
          )}
        />
        {charactersRemaining && (
          <p className="text-zinc-400 text-xs absolute right-3 bottom-3">
            {charactersRemaining}
          </p>
        )}
      </div>
      {footerText && (
        <p className={cn(
          "text-xs text-muted-foreground mt-1.5",
          footerTextClassName
        )}>
          {footerText}
        </p>
      )}
      {errorText && (
        <p className={cn(
          "font-light text-sm mt-1.5",
          isLoading ? "text-zinc-300" : "text-red-600"
        )}>
          {errorText}
        </p>
      )}
    </label>
  )
}

// FormDateInput Component (Simplified version without external dependencies)
export const FormDateInput = ({
  labelText,
  errorText,
  footerTextClassName,
  value,
  onChange,
  footerText,
  name,
  id,
  placeholder,
  wrapperClassName,
  labelClassName,
  inputClassName,
  isLoading = false,
  disabled = false,
  inputSize = "MEDIUM"
}: IProps & React.InputHTMLAttributes<HTMLInputElement>) => {
  const sizeClass = inputSize === "LARGE" ? "!py-4" : "!py-3.5"
  const [open, setOpen] = React.useState(false);

  // Convert value to Date if possible
  const dateValue = value ? new Date(value as string) : undefined;

  const handleSelect = (date: Date | undefined) => {
    setOpen(false);
    if (onChange && date) {
      // Format as yyyy-MM-dd for consistency
      const formatted = format(date, "yyyy-MM-dd");
      onChange({ target: { value: formatted, name } });
    }
  };

  return (
    <label htmlFor={id} className={wrapperClassName}>
      {labelText && (
        <p className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5",
          isLoading && "text-muted-foreground",
          labelClassName
        )}>
          {labelText}
        </p>
      )}
      <div className="relative">
        {/* {showHintText && (
          <span className={cn(
            "absolute top-1.5 left-3.5 lg:left-4.5 text-muted text-[10px] animate-fade-in uppercase",
            (showHintText && !value) && "!hidden"
          )}>
            {placeholder}
          </span>
        )} */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={isLoading || disabled}
              className={cn(
              "flex items-center h-[2.35rem] w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              isLoading && "bg-muted animate-pulse",
              // sizeClass,
              inputClassName
            )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-muted" />
              <span>
                {dateValue ? format(dateValue, "PPP") : placeholder || "Pick a date"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleSelect}
              initialFocus
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
        {/* <input
          type="date"
          value={value as string}
          onChange={(e) => onChange && onChange(e)}
          name={name}
          id={id}
          placeholder={!isLoading ? placeholder : ""}
          disabled={isLoading || disabled}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            isLoading && "bg-muted animate-pulse",
            sizeClass,
            inputClassName
          )}
        /> */}
      </div>
      {footerText && (
        <p className={cn(
          "font-light text-xs mt-1.5",
          isLoading ? "text-zinc-300" : "text-zinc-400",
          footerTextClassName
        )}>
          {footerText}
        </p>
      )}
      {errorText && (
        <p className={cn(
          "font-light text-sm mt-1.5",
          isLoading ? "text-zinc-300" : "text-red-600"
        )}>
          {errorText}
        </p>
      )}
    </label>
  )
}

// FormPhoneInput Component (using our PhoneInput)
export const FormPhoneInput = ({
  labelText,
  errorText,
  footerTextClassName,
  value,
  onChange,
  footerText,
  name,
  id,
  placeholder,
  wrapperClassName,
  labelClassName,
  inputClassName,
  isLoading = false,
  disabled = false,
  required,
  showHintText = false,
  inputSize = "MEDIUM"
}: IProps) => {
  const handleChange = (phoneValue: string) => {
    if (onChange) {
      onChange({ target: { value: phoneValue, name } })
    }
  }

  const sizeClass = inputSize === "LARGE" ? "[&>*>*]:!py-4" : "[&>*>*]:!py-3"

  return (
    <label htmlFor={id} className={wrapperClassName}>
      {labelText && (
        <p className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5",
          isLoading && "text-muted-foreground",
          labelClassName
        )}>
          {labelText}
        </p>
      )}
      <div className="relative">
        {showHintText && (
          <span className={cn(
            "absolute top-1.5 left-3.5 lg:left-4.5 text-muted text-[10px] animate-fade-in uppercase z-[1]",
            (showHintText && !value) && "!hidden"
          )}>
            {placeholder}
          </span>
        )}
        <PhoneInput
          value={value as string}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={cn(
            sizeClass,
            inputClassName
          )}
        />
      </div>
      {footerText && (
        <p className={cn(
          "font-light text-xs mt-1.5",
          isLoading ? "text-zinc-300" : "text-zinc-400",
          footerTextClassName
        )}>
          {footerText}
        </p>
      )}
      {errorText && (
        <p className={cn(
          "font-light text-sm mt-1.5",
          isLoading ? "text-zinc-300" : "text-red-600"
        )}>
          {errorText}
        </p>
      )}
    </label>
  )
}

// FormNumberInput Component
export const FormNumberInput = ({
  ...props
}: IProps & React.InputHTMLAttributes<HTMLInputElement>) => {
  const handleChange = (arg: React.ChangeEvent<HTMLInputElement> | { target: { value: string | number | boolean; name?: string } }) => {
    if ('nativeEvent' in arg) {
      const e = arg as React.ChangeEvent<HTMLInputElement>
      if (props?.onChange) {
        const numericValue = e.target.value.replace(/,/g, "").trim()
        const finalValue = numericValue === "" ? "" : (isNaN(Number(numericValue)) ? "" : Number(numericValue))
        props?.onChange({
          target: {
            value: finalValue,
            name: props?.name ?? ""
          }
        })
      }
    }
  }

  const formatValue = (val: string | number | boolean | undefined) => {
    if (val === "" || val === null || val === undefined) return ""
    const num = Number(val)
    return isNaN(num) ? "" : num.toLocaleString()
  }

  return (
    <FormText
      {...props}
      value={formatValue(props?.value)}
      onChange={handleChange}
      inputMode="numeric"
      type="text"
    />
  )
}

// FormCountrySelect Component
interface ICountrySelectProps extends Omit<IProps, "onChange">, ISelectProps {
  showFlag?: boolean;
  onChange?: (arg: { target: { value: string | number, name?: string } } | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
}

export const FormCountrySelect = ({
  labelText,
  errorText,
  footerTextClassName,
  ref,
  defaultValue = "Select Country",
  onChange,
  footerText,
  name,
  id,
  placeholder,
  value,
  wrapperClassName,
  labelClassName,
  isLoading = false,
  disabled = false,
  icon,
  required,
  inputClassName,
  triggerClassName,
  contentClassName,
  showHintText = false,
  inputSize = "MEDIUM",
  showFlag = false
}: ICountrySelectProps) => {
  // const onValueChange = (arg: string | number | { target: { value: string | number | boolean; name?: string } } | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
  //   if (typeof arg === 'string' || typeof arg === 'number') {
  //     if (onChange) onChange({ target: { name, value: arg } })
  //   }
  // }

  const countries = Country.getAllCountries()
  const options = countries.map((country: { isoCode: string; name: string; flag?: string }) => ({
    value: country.isoCode,
    text: showFlag ? (
      <div className="flex items-center gap-2">
        <span className="text-lg">{country.flag || "🏳️"}</span>
        <span>{country.name}</span>
      </div>
    ) : (
      country.name
    )
  }))

  return (
    <FormSelect
      labelText={labelText}
      errorText={errorText}
      footerTextClassName={footerTextClassName}
      ref={ref}
      defaultValue={defaultValue as string}
      options={options}
      onChange={onChange as (arg: string | number | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | {
          target: {
              value: string | number | boolean;
              name?: string;
          };
        }) => void
      }
      footerText={footerText}
      name={name}
      id={id}
      placeholder={placeholder}
      value={value as string}
      wrapperClassName={wrapperClassName}
      labelClassName={labelClassName}
      isLoading={isLoading}
      disabled={disabled}
      icon={icon}
      required={required}
      inputClassName={inputClassName}
      triggerClassName={triggerClassName}
      contentClassName={contentClassName}
      showHintText={showHintText}
      inputSize={inputSize}
    />
  )
}

// FormRegionSelect Component
interface IRegionSelectProps extends Omit<IProps, "onChange">, ISelectProps {
  countryCode: string;
  onChange?: (arg: { target: { value: string | number, name?: string } } | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
}

// FormMultiSelect Component
interface IMultiSelectProps extends Omit<IProps, "onChange" | "value">, ISelectProps {
  value?: string[];
  onChange?: (arg: { target: { value: string[], name?: string } } | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
  maxSelection?: number;
  placeholder?: string;
}

export const FormRegionSelect = ({
  labelText,
  errorText,
  footerTextClassName,
  ref,
  defaultValue = "Select Region",
  onChange,
  footerText,
  name,
  id,
  placeholder,
  value,
  wrapperClassName,
  labelClassName,
  isLoading = false,
  disabled = false,
  icon,
  required,
  inputClassName,
  triggerClassName,
  contentClassName,
  showHintText = false,
  inputSize = "MEDIUM",
  countryCode
}: IRegionSelectProps) => {
  // const onValueChange = (arg: string | number | { target: { value: string | number | boolean; name?: string } } | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
  //   if (typeof arg === 'string' || typeof arg === 'number') {
  //     if (onChange) onChange({ target: { name, value: arg } })
  //   }
  // }

  const regions = State.getStatesOfCountry(countryCode)
  const options = regions.map((region: { name: string; isoCode: string }) => ({
    value: region.name,
    text: region.name
  }))

  return (
    <FormSelect
      labelText={labelText}
      errorText={errorText}
      footerTextClassName={footerTextClassName}
      ref={ref}
      defaultValue={defaultValue as string}
      options={options}
      onChange={onChange as (arg: string | number | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | {
          target: {
              value: string | number | boolean;
              name?: string;
          };
        }) => void
      }
      footerText={footerText}
      name={name}
      id={id}
      placeholder={placeholder}
      value={value as string}
      wrapperClassName={wrapperClassName}
      labelClassName={labelClassName}
      isLoading={isLoading}
      disabled={disabled}
      icon={icon}
      required={required}
      inputClassName={inputClassName}
      triggerClassName={triggerClassName}
      contentClassName={contentClassName}
      showHintText={showHintText}
      inputSize={inputSize}
    />
  )
}

// FormMultiSelect Component
export const FormMultiSelect = ({
  labelText,
  errorText,
  footerTextClassName,
  ref,
  onChange,
  footerText,
  name,
  id,
  placeholder = "Select options",
  value = [],
  options,
  wrapperClassName,
  labelClassName,
  isLoading = false,
  disabled = false,
  required,
  inputClassName,
  triggerClassName,
  contentClassName,
  showHintText = false,
  inputSize = "MEDIUM",
  maxSelection
}: IMultiSelectProps) => {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(Array.isArray(value) ? value : [])

  const onValueChange = (newValues: string[]) => {
    if (maxSelection && newValues.length > maxSelection) {
      return // Don't allow more than max selection
    }

    setSelectedValues(newValues)

    if (onChange) {
      onChange({ target: { name, value: newValues } })
    }
  }

  const handleSelectChange = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue]

    onValueChange(newValues)
  }

  const sizeClass = inputSize === "LARGE" ? "!py-4" : "!py-3.5"

  const displayText = selectedValues.length > 0
    ? selectedValues.length === 1
      ? options?.find(opt => opt.value === selectedValues[0])?.text || selectedValues[0]
      : `${selectedValues.length} selected`
    : placeholder

  return (
    <label htmlFor={id} className={wrapperClassName}>
      {labelText && (
        <p className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5",
          isLoading && "text-muted-foreground",
          labelClassName
        )}>
          {labelText}
        </p>
      )}
      <div className="relative">
        {showHintText && (
          <span className={cn(
            "absolute top-1.5 left-3.5 lg:left-4.5 text-muted text-[10px] animate-fade-in uppercase z-[1]",
            (showHintText && selectedValues.length === 0) && "!hidden"
          )}>
            {placeholder}
          </span>
        )}
        <Select
          required={required}
          onValueChange={() => {}} // We'll handle selection manually
          value=""
          name={name}
          disabled={disabled}
        >
          <SelectTrigger
            ref={ref as React.LegacyRef<HTMLButtonElement>}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              isLoading && "bg-muted animate-pulse",
              sizeClass,
              selectedValues.length > 0 ? "!text-foreground [&>svg]:!hidden" : "!text-muted-foreground",
              triggerClassName,
              inputClassName
            )}
          >
            <span className={cn(
              selectedValues.length === 0 && "text-muted-foreground"
            )}>
              {displayText}
            </span>
            {selectedValues.length > 0 && !isLoading && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedValues([])
                  if (onChange) {
                    onChange({ target: { name, value: [] } })
                  }
                }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors ml-2 z-10"
                aria-label="Clear all selections"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <path
                    d="M9 3L3 9M3 3L9 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </SelectTrigger>
          <SelectContent className={contentClassName}>
            {options && options.map((option, index: number) => {
              const isSelected = selectedValues.includes(option.value as string)
              return (
                <div
                  key={`${labelText}-${index}`}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => handleSelectChange(option.value as string)}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <div className={cn(
                      "h-2 w-2 rounded-sm border border-primary",
                      isSelected ? "bg-primary" : "bg-transparent"
                    )} />
                  </span>
                  <span className="!font-lexend !font-zinc-600 !font-light">
                    {option.text}
                  </span>
                </div>
              )
            })}
            {maxSelection && (
              <div className="px-2 py-1 text-xs text-muted-foreground border-t mt-1">
                {selectedValues.length}/{maxSelection} selected
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
      {footerText && (
        <p className={cn(
          "text-xs text-muted-foreground mt-1.5",
          footerTextClassName
        )}>
          {footerText}
        </p>
      )}
      {errorText && (
        <p className={cn(
          "text-sm mt-1.5 font-light",
          isLoading ? "text-zinc-300" : "text-red-600"
        )}>
          {errorText}
        </p>
      )}
    </label>
  )
}
// FormPaginatedSelect Component
interface IFormPaginatedSelectProps extends IProps, ISelectProps {
  searchPlaceholder?: string;
  pagination?: PaginatedResponse<unknown>['pagination'];
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
}

export const FormPaginatedSelect = ({
  labelText,
  errorText,
  footerTextClassName,
  ref,
  defaultValue = "Select Option",
  options,
  onChange,
  footerText,
  name,
  id,
  placeholder,
  value,
  wrapperClassName,
  labelClassName,
  isLoading = false,
  disabled = false,
  icon,
  iconPosition,
  required,
  inputClassName,
  triggerClassName,
  contentClassName,
  showHintText = false,
  inputSize = "MEDIUM",
  searchPlaceholder = "Search...",
  pagination,
  onPageChange,
  onSearchChange
}: IFormPaginatedSelectProps) => {
  const [searchTerm, setSearchTerm] = React.useState('')

  const onValueChange = (e: string | number) => {
    if (onChange) onChange({ target: { name, value: e } })
  }

  const handleClearValue = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onChange) {
      onChange({ target: { name, value: "" } })
    }
  }

  const filteredOptions = options?.filter(option =>
    option.text && option.text.toString().toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const paginatedOptions = filteredOptions

  const handlePageChange = (page: number) => {
    if (onPageChange) onPageChange(page)
  }

  const sizeClass = inputSize === "LARGE" ? "!py-4" : "!py-3.5"

  return (
    <label htmlFor={id} className={wrapperClassName}>
      {labelText && (
        <p className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5",
          isLoading && "text-muted-foreground",
          labelClassName
        )}>
          {labelText}
        </p>
      )}
      <div className="relative">
        {showHintText && (
          <span className={cn(
            "absolute top-1.5 left-3.5 lg:left-4.5 text-muted text-[10px] animate-fade-in uppercase z-[1]",
            (showHintText && !value) && "!hidden"
          )}>
            {placeholder}
          </span>
        )}
        <Select
          key={`select-${value || 'empty'}`}
          required={required}
          onValueChange={onValueChange}
          value={value as string || ""}
          name={name}
          disabled={disabled}
        >
          {value && !isLoading && !disabled && (
            <button
              type="button"
              onMouseUp={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleClearValue(e)
              }}
              className="flex absolute top-0 bottom-0 my-auto right-3 items-center justify-center w-4.5 h-4.5 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors ml-2 z-10"
              aria-label="Clear selection"
            >
              <IconX className="!size-3 !stroke-3 !text-slate-500 !font-bold" />
            </button>
          )}
          <SelectTrigger
            ref={ref as React.LegacyRef<HTMLButtonElement>}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              isLoading && "bg-muted animate-pulse",
              sizeClass,
              isLoading && "[&_*]:!invisible",
              !!value ? "!text-foreground [&>svg]:!hidden" : "!text-muted-foreground",
              icon
                ? (iconPosition === "right" ? "!pr-9 !pl-3 lg:!pl-3.5" : "!pl-10 pr-3 lg:pr-3.5")
                : "",
              triggerClassName,
              inputClassName
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={contentClassName}>
            <div className="p-2">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  if (onSearchChange) onSearchChange(e.target.value)
                }}
                className="w-full px-2 py-1 border border-input rounded text-sm"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {paginatedOptions.map((option, index: number) => (
                <SelectItem
                  key={`${labelText}-${index}`}
                  value={option.value as string}
                  className="!font-lexend !font-zinc-600 !font-light"
                >
                  {option.text}
                </SelectItem>
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="p-2 border-t flex justify-between items-center">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={!pagination.hasPrev}
                  className="px-2 py-1 text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-muted-foreground">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                  disabled={!pagination.hasNext}
                  className="px-2 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </SelectContent>
        </Select>
        {icon && (
          <span className={cn(
            "absolute top-0 bottom-0 h-max my-auto flex items-center justify-center",
            isLoading && "invisible",
            iconPosition === "right" ? "right-3" : "left-3"
          )}>
            {icon}
          </span>
        )}
      </div>
      {footerText && (
        <p className={cn(
          "text-xs text-muted-foreground mt-1.5",
          footerTextClassName
        )}>
          {footerText}
        </p>
      )}
      {errorText && (
        <p className={cn(
          "text-sm mt-1.5 font-light",
          isLoading ? "text-zinc-300" : "text-red-600"
        )}>
          {errorText}
        </p>
      )}
    </label>
  )
}
