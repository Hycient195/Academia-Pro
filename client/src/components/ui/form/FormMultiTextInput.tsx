import { PlusIcon, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface IProps {
  values: string[]
  setFormData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
  propertyKey: string;
  labelText?: string | React.ReactNode;
  placeholder?: string;
  errorText?: string;
  footerText?: string|React.ReactNode;
  footerTextClassName?: string;
  isLoading?: boolean;
  inputClassName?: string;
  wrapperClassName?: string;
  required?: boolean;
}

// Helper to update nested property by key path (e.g. "user.name.hobbies")
function updateByKeyPath(obj: Record<string, unknown>, keyPath: string, updater: (arr: string[]) => string[]) {
  const keys = keyPath.split(".");
  const lastKey = keys.pop()!;
  let nested = obj;
  for (const key of keys) {
    if (!nested[key] || typeof nested[key] !== 'object') {
      nested[key] = {};
    }
    nested = nested[key] as Record<string, unknown>;
  }
  nested[lastKey] = updater(Array.isArray(nested[lastKey]) ? nested[lastKey] as string[] : []);
  return { ...obj };
}

export default function FormMultiTextInput({
  values,
  setFormData,
  propertyKey,
  labelText,
  placeholder = "",
  errorText,
  footerText,
  footerTextClassName,
  isLoading,
  inputClassName,
  wrapperClassName,
  required
}: IProps) {
  const [inputText, setInputText] = useState<string>("");

  const handleRemoveItem = (index: number) => {
    setFormData((prev) =>
      updateByKeyPath(prev, propertyKey, (arr) => arr.filter((_, i) => i !== index))
    );
  };

  const handleAddItem = () => {
    if (!inputText.trim()) return;
    setFormData((prev) =>
      updateByKeyPath(prev, propertyKey, (arr) => [...arr, inputText.trim()])
    );
    setInputText("");
  };

  const handleEditItem = (text: string, idx: number) => {
    setFormData((prev) =>
      updateByKeyPath(prev, propertyKey, (arr) => {
        const updated = [...arr];
        updated[idx] = text;
        return updated;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className={cn("space-y-2", wrapperClassName)}>
      {labelText && (
        <label className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          isLoading && "text-muted-foreground"
        )}>
          {labelText}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={cn(
        "flex min-h-[2.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isLoading && "bg-muted animate-pulse",
        inputClassName
      )}>
        <div className="flex flex-wrap items-center gap-1 flex-1">
          {values?.map((value, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
            >
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleEditItem(e.currentTarget.textContent || "", index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                className="outline-none min-w-[2ch] cursor-text"
              >
                {value}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          <input
            type="text"
            placeholder={values?.length === 0 ? placeholder : ""}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            disabled={isLoading}
          />
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          disabled={!inputText.trim() || isLoading}
          className="ml-2 p-1 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {footerText && (
        <p className={cn(
          "text-xs text-muted-foreground",
          footerTextClassName
        )}>
          {footerText}
        </p>
      )}

      {errorText && (
        <p className={cn(
          "text-sm text-red-600"
        )}>
          {errorText}
        </p>
      )}
    </div>
  );
}