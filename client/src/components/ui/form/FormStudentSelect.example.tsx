"use client"

import React, { useState } from 'react'
import { FormStudentSelect } from './FormStudentSelect'
import { Button } from '../button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'

export const FormStudentSelectExample: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const handleSingleSelect = (value: string) => {
    setSelectedStudentId(value)
  }

  const handleMultiSelect = (value: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(value)) {
        return prev.filter(id => id !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>FormStudentSelect Examples</CardTitle>
          <CardDescription>
            Examples of how to use the FormStudentSelect component with different configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Single Student Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Single Student Selection</h3>
            <FormStudentSelect
              labelText="Select a Student"
              placeholder="Choose a student"
              value={selectedStudentId}
              onChange={(e) => handleSingleSelect(e.target.value)}
              required
            />
            {selectedStudentId && (
              <p className="text-sm text-muted-foreground">
                Selected Student ID: {selectedStudentId}
              </p>
            )}
          </div>

          {/* Multiple Student Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Multiple Student Selection</h3>
            <FormStudentSelect
              labelText="Select Students"
              placeholder="Search and select students"
              onChange={(e) => handleMultiSelect(e.target.value)}
            />
            {selectedStudents.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Students ({selectedStudents.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map((studentId) => (
                    <span
                      key={studentId}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {studentId}
                      <button
                        onClick={() => handleMultiSelect(studentId)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudents([])}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* With Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">With Custom Filters</h3>
            <FormStudentSelect
              labelText="Select Student (Filtered)"
              placeholder="Search students"
              filters={{
                statuses: ['active'],
                enrollmentType: 'regular'
              }}
              onChange={(e) => console.log('Filtered selection:', e.target.value)}
            />
          </div>

          {/* Usage in Promotion Wizard Context */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Usage in Promotion Wizard</h3>
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 mb-4">
                This component is used in the PromotionWizard when scope is set to &ldquo;Selected Students&rdquo;.
                It allows administrators to search and select specific students for promotion.
              </p>
              <code className="text-xs bg-white p-2 rounded block">
                {`<FormStudentSelect
  labelText="Select Students"
  placeholder="Search and select students"
  onChange={handleStudentSelectChange}
  schoolId={currentSchoolId}
/>`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}