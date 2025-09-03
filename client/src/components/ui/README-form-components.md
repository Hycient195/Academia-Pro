# Form Components System

A comprehensive, unified form components system with consistent styling, behavior, and TypeScript support.

## Overview

This system provides a set of form components that follow a unified design pattern, ensuring consistency across your application. All components share the same prop interface and styling approach.

## Components

### FormText
Basic text input component with support for different input types.

```tsx
<FormText
  labelText="Email Address"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={handleChange}
  required
  footerText="We'll never share your email"
/>
```

### FormSelect
Dropdown select component with search and custom options.

```tsx
<FormSelect
  labelText="Department"
  placeholder="Select department"
  options={[
    { value: "engineering", text: "Engineering" },
    { value: "marketing", text: "Marketing" }
  ]}
  value={department}
  onChange={handleChange}
  required
/>
```

### FormTextArea
Multi-line text input with character counting.

```tsx
<FormTextArea
  labelText="Description"
  placeholder="Tell us about yourself"
  value={description}
  onChange={handleChange}
  rows={4}
  charactersRemaining={500 - description.length}
/>
```

### FormDateInput
Date input component using native HTML5 date picker.

```tsx
<FormDateInput
  labelText="Date of Birth"
  placeholder="Select date"
  value={dateOfBirth}
  onChange={handleChange}
/>
```

### FormPhoneInput
Phone number input with country code selection.

```tsx
<FormPhoneInput
  labelText="Phone Number"
  placeholder="Enter phone number"
  value={phone}
  onChange={handleChange}
/>
```

### FormNumberInput
Number input with automatic formatting and validation.

```tsx
<FormNumberInput
  labelText="Salary"
  placeholder="Enter salary"
  value={salary}
  onChange={handleChange}
/>
```

## Shared Props Interface

All components share a common `IProps` interface:

```typescript
interface IProps {
  labelText?: string | React.ReactNode
  value?: string | number | boolean
  defaultValue?: string | number | boolean
  onChange?: (arg?: any) => void
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
  ref?: React.Ref<any>
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  showHintText?: boolean
  inputSize?: "MEDIUM" | "LARGE"
}
```

## Key Features

### 🎨 Consistent Styling
- Unified design language across all components
- Consistent spacing, colors, and typography
- Matches your existing design system

### 🔄 Loading States
- Built-in loading animations
- Skeleton states for better UX
- Disabled interactions during loading

### ⚠️ Error Handling
- Error text display
- Visual error states
- Form validation support

### 📱 Responsive Design
- Mobile-first approach
- Flexible sizing options
- Touch-friendly interactions

### ♿ Accessibility
- Proper ARIA labels
- Keyboard navigation
- Screen reader support

### 🎯 Size Variants
- `MEDIUM`: Standard size (default)
- `LARGE`: Larger size for important fields

### 🎨 Icon Support
- Left and right icon positioning
- Automatic spacing adjustments
- Icon visibility in loading states

### 💡 Hint Text
- Animated placeholder hints
- Appears/disappears based on value
- Customizable positioning

## Usage Examples

### Basic Form
```tsx
import { FormText, FormSelect, Button } from "@/components/ui/form-components"

function UserForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: ""
  })

  const handleChange = (field: string) => (e: any) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="space-y-4">
      <FormText
        labelText="Full Name"
        placeholder="Enter your name"
        value={formData.name}
        onChange={handleChange("name")}
        required
      />

      <FormText
        labelText="Email"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange("email")}
        required
      />

      <FormSelect
        labelText="Department"
        placeholder="Select department"
        options={departmentOptions}
        value={formData.department}
        onChange={handleChange("department")}
        required
      />

      <Button type="submit">Submit</Button>
    </div>
  )
}
```

### With React Hook Form
```tsx
import { useForm } from "react-hook-form"
import { FormText } from "@/components/ui/form-components"

function HookFormExample() {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormText
        labelText="Email"
        type="email"
        placeholder="Enter your email"
        {...register("email", { required: "Email is required" })}
        errorText={errors.email?.message}
        required
      />
    </form>
  )
}
```

### Loading and Error States
```tsx
<FormText
  labelText="Username"
  placeholder="Enter username"
  value={username}
  onChange={handleChange}
  isLoading={isSubmitting}
  errorText={error}
  required
/>
```

## Styling Customization

### Custom Classes
```tsx
<FormText
  labelText="Custom Styled Input"
  placeholder="Custom input"
  wrapperClassName="custom-wrapper"
  labelClassName="custom-label"
  inputClassName="custom-input"
  footerTextClassName="custom-footer"
/>
```

### Size Variants
```tsx
<FormText
  inputSize="LARGE"
  labelText="Large Input"
  placeholder="Large input field"
/>
```

### Icon Integration
```tsx
import { Search } from "lucide-react"

<FormText
  labelText="Search"
  placeholder="Search..."
  icon={<Search className="h-4 w-4" />}
  iconPosition="left"
/>
```

## Best Practices

### Form Structure
- Group related fields together
- Use consistent spacing between form elements
- Provide clear labels and placeholders
- Include helpful footer text

### Validation
- Show validation errors immediately
- Use appropriate input types
- Provide clear error messages
- Handle loading states properly

### Accessibility
- Always include labels
- Use semantic HTML
- Provide keyboard navigation
- Test with screen readers

### Performance
- Use controlled components when possible
- Debounce rapid input changes
- Optimize re-renders with memoization
- Handle large option lists efficiently

## Migration Guide

If you're migrating from individual input components:

1. **Replace imports**: Update your imports to use the new form components
2. **Update props**: Most props remain the same, but check the interface
3. **Update event handlers**: Ensure onChange handlers match the expected format
4. **Test thoroughly**: Verify all functionality works as expected

## Component Architecture

The system is built on top of your existing UI components:
- Uses `Input`, `Textarea`, `Select` from your UI library
- Integrates with your design tokens and utilities
- Follows your established component patterns
- Maintains consistency with your design system

This ensures seamless integration and maintains the visual consistency of your application while providing enhanced functionality and developer experience.