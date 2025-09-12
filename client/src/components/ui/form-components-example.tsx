"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import {
  FormSelect,
  FormText,
  FormTextArea,
  FormDateInput,
  FormPhoneInput,
  FormNumberInput,
  FormCountrySelect,
  FormRegionSelect,
  FormMultiSelect
} from "./form/form-components"

export function FormComponentsExample() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    dateOfBirth: "",
    salary: "",
    department: "",
    role: "",
    country: "",
    region: "",
    skills: [] as string[]
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string | number | boolean } }) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      [field]: String(value)
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log("Form submitted:", formData)
    alert("Form submitted successfully!")
    setIsLoading(false)
  }

  const departmentOptions = [
    { value: "engineering", text: "Engineering" },
    { value: "marketing", text: "Marketing" },
    { value: "sales", text: "Sales" },
    { value: "hr", text: "Human Resources" },
    { value: "finance", text: "Finance" }
  ]

  const roleOptions = [
    { value: "manager", text: "Manager" },
    { value: "developer", text: "Developer" },
    { value: "designer", text: "Designer" },
    { value: "analyst", text: "Analyst" }
  ]

  const skillsOptions = [
    { value: "javascript", text: "JavaScript" },
    { value: "typescript", text: "TypeScript" },
    { value: "react", text: "React" },
    { value: "node", text: "Node.js" },
    { value: "python", text: "Python" },
    { value: "java", text: "Java" },
    { value: "csharp", text: "C#" },
    { value: "php", text: "PHP" },
    { value: "html", text: "HTML" },
    { value: "css", text: "CSS" }
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Form Components Example</CardTitle>
        <CardDescription>
          Demonstration of unified form components with consistent styling and behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Text Input */}
        <FormText
          labelText="Full Name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange("name")}
          required
          showHintText={true}
          inputSize="MEDIUM"
        />

        {/* Email Input */}
        <FormText
          labelText="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange("email")}
          required
          footerText="We'll never share your email with anyone else."
        />

        {/* Phone Input */}
        <FormPhoneInput
          labelText="Phone Number"
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={handleChange("phone")}
          footerText="Include country code for international numbers"
        />

        {/* Country and Region Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormCountrySelect
            labelText="Country"
            placeholder="Select your country"
            value={formData.country}
            onChange={handleChange("country")}
            showFlag={true}
            required
          />

          <FormRegionSelect
            labelText="Region/State"
            placeholder="Select your region"
            value={formData.region}
            onChange={handleChange("region")}
            countryCode={formData.country}
            required
          />
        </div>

        {/* Select Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            labelText="Department"
            placeholder="Select department"
            options={departmentOptions}
            value={formData.department}
            onChange={handleChange("department")}
            required
          />

          <FormSelect
            labelText="Role"
            placeholder="Select role"
            options={roleOptions}
            value={formData.role}
            onChange={handleChange("role")}
            required
          />
        </div>

        {/* Multi-Select Input */}
        <FormMultiSelect
          labelText="Skills"
          placeholder="Select your skills"
          options={skillsOptions}
          value={formData.skills}
          onChange={(arg) => {
            if ('target' in arg) {
              const value = arg.target.value
              setFormData(prev => ({
                ...prev,
                skills: Array.isArray(value) ? value : [value].filter(Boolean)
              }))
            } else {
              setFormData(prev => ({
                ...prev,
                skills: Array.isArray(arg) ? arg : [arg].filter(Boolean)
              }))
            }
          }}
          maxSelection={5}
          footerText="Select up to 5 skills that best describe your expertise"
        />

        {/* Number Input */}
        <FormNumberInput
          labelText="Salary"
          placeholder="Enter salary"
          value={formData.salary}
          onChange={handleChange("salary")}
          footerText="Annual salary in your local currency"
        />

        {/* Date Input */}
        <FormDateInput
          labelText="Date of Birth"
          placeholder="Select date of birth"
          value={formData.dateOfBirth}
          onChange={handleChange("dateOfBirth")}
        />

        {/* Text Area */}
        <FormTextArea
          labelText="Description"
          placeholder="Tell us about yourself"
          value={formData.description}
          onChange={handleChange("description")}
          rows={4}
          charactersRemaining={500 - (formData.description?.length || 0)}
          footerText="Brief description of your background and experience"
        />

        {/* Loading State Example */}
        <FormText
          labelText="Loading Example"
          placeholder="This field shows loading state"
          isLoading={isLoading}
          value=""
          onChange={() => {}}
        />

        {/* Error State Example */}
        <FormText
          labelText="Error Example"
          placeholder="This field shows error state"
          value="invalid@email"
          onChange={() => {}}
          errorText="Please enter a valid email address"
        />

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Submitting..." : "Submit Form"}
        </Button>

        {/* Form Data Display */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Current Form Data:</h3>
          <pre className="text-xs text-muted-foreground">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}