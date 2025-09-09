"use client"

import * as React from "react"
import { PhoneInput } from "./phone-input"
import { Button } from "./button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

export function PhoneInputExample() {
  const [phoneValue, setPhoneValue] = React.useState<string>("")

  const handlePhoneChange = (value: string) => {
    setPhoneValue(value)
    console.log("Phone value changed:", value)
  }

  const handleSubmit = () => {
    console.log("Submitting phone:", phoneValue)
    alert(`Phone: ${phoneValue}`)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Phone Input Example</CardTitle>
        <CardDescription>
          A phone input component with country code selection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Number</label>
          <PhoneInput
            value={phoneValue}
            onChange={handlePhoneChange}
            placeholder="Enter your phone number"
            defaultCountry="NG"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Small Size</label>
          <PhoneInput
            size="sm"
            placeholder="Small phone input"
            defaultCountry="GB"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Disabled</label>
          <PhoneInput
            disabled
            value="+15551234"
            placeholder="Disabled input"
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Submit Phone Number
        </Button>

        <div className="text-xs text-muted-foreground">
          Current value: {phoneValue || "No phone number entered"}
        </div>
      </CardContent>
    </Card>
  )
}