# PhoneInput Component

A comprehensive phone input component with country code selection for React applications.

## Features

- 🌍 **Country Selection**: Dropdown with country flags and dial codes
- 📱 **Phone Input**: Standard phone number input field
- 🎨 **Consistent Styling**: Matches your design system
- ♿ **Accessible**: Full keyboard navigation and screen reader support
- 📏 **Flexible Sizing**: Small and default size variants
- 🔧 **Form Integration**: Works with react-hook-form
- 🌐 **International**: Supports 50+ countries including African nations

## Installation

The component is already included in your UI components library.

```tsx
import { PhoneInput } from "@/components/ui/phone-input"
```

## Basic Usage

```tsx
import { PhoneInput } from "@/components/ui/phone-input"

function MyForm() {
  const [phone, setPhone] = useState("+1234567890")

  return (
    <PhoneInput
      value={phone}
      onChange={setPhone}
      placeholder="Enter phone number"
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Current phone value (e.g., "+1234567890") |
| `onChange` | `(value: string) => void` | - | Callback when value changes |
| `defaultCountry` | `string` | `"US"` | Default selected country code |
| `placeholder` | `string` | `"Enter phone number"` | Input placeholder text |
| `disabled` | `boolean` | `false` | Disable the input |
| `size` | `"sm" \| "default"` | `"default"` | Component size variant |
| `className` | `string` | - | Additional CSS classes |

## With React Hook Form

```tsx
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { PhoneInput } from "@/components/ui/phone-input"

function MyForm() {
  const form = useForm({
    defaultValues: {
      phone: "+234123456789"
    }
  })

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <PhoneInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter your phone number"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  )
}
```

## Size Variants

### Default Size
```tsx
<PhoneInput size="default" />
```

### Small Size
```tsx
<PhoneInput size="sm" />
```

## Country List

The component includes 50+ countries with their flags and dial codes:

- 🇺🇸 United States (+1)
- 🇬🇧 United Kingdom (+44)
- 🇳🇬 Nigeria (+234)
- 🇰🇪 Kenya (+254)
- 🇬🇭 Ghana (+233)
- And many more...

## Styling

The component uses your existing design system classes and supports:

- Focus states with ring styling
- Error states with destructive colors
- Disabled states with opacity
- Consistent border and shadow styling

## Accessibility

- Full keyboard navigation support
- Screen reader friendly with proper ARIA labels
- Focus management between country selector and input
- High contrast support

## Example Implementation

See `phone-input-example.tsx` for a complete working example with different use cases.