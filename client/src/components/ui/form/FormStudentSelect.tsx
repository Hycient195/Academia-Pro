"use client"

import React, { useState } from 'react'
import { FormPaginatedSelect } from './form-components'
import { IStudentFilters } from '@academia-pro/types/school-admin'
import { useGetStudentsQuery } from '@/redux/api/school-admin/studentApis'

interface FormStudentSelectProps {
  labelText?: string
  value?: string
  name?: string
  onChange?: (arg: { target: { value: string; name?: string } } | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  schoolId?: string
  filters?: Partial<IStudentFilters>
  // Additional filter props for convenience
  stages?: string[]
  gradeCodes?: string[]
  streamSections?: string[]
  statuses?: string[]
  enrollmentType?: 'regular' | 'special_needs' | 'gifted' | 'international' | 'transfer'
  gender?: 'male' | 'female' | 'other'
  isBoarding?: boolean
}

export const FormStudentSelect: React.FC<FormStudentSelectProps> = ({
  labelText = "Select Student",
  value,
  onChange,
  placeholder = "Choose a student",
  required,
  disabled,
  name,
  schoolId,
  filters = {},
  stages,
  gradeCodes,
  streamSections,
  statuses,
  enrollmentType,
  gender,
  isBoarding
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  // Merge provided filters with search and pagination
  const queryFilters: IStudentFilters & { page: number; limit: number } = {
    ...filters,
    schoolId: schoolId || filters.schoolId,
    search: searchTerm || filters.search,
    stages: stages || filters.stages,
    gradeCodes: gradeCodes || filters.gradeCodes,
    streamSections: streamSections || filters.streamSections,
    statuses: statuses || filters.statuses,
    enrollmentType: enrollmentType || filters.enrollmentType,
    gender: gender || filters.gender,
    isBoarding: isBoarding !== undefined ? isBoarding : filters.isBoarding,
    page,
    limit
  }

  const { data, isLoading, error } = useGetStudentsQuery(queryFilters)

  const apiOptions = data?.data?.map((student) => ({
    value: student.id,
    text: `${student.firstName} ${student.lastName} ${student.admissionNumber ? `(${student.admissionNumber})` : ''}`.trim(),
  })) || []

  // Ensure selected value is always available in options
  const selectedStudent = data?.data?.find(student => student.id === value)
  const options = selectedStudent && !apiOptions.find(opt => opt.value === value)
    ? [{ value: selectedStudent.id, text: `${selectedStudent.firstName} ${selectedStudent.lastName} ${selectedStudent.admissionNumber ? `(${selectedStudent.admissionNumber})` : ''}`.trim() }, ...apiOptions]
    : apiOptions

  const pagination = data?.pagination ? {
    total: data.pagination.total,
    page: data.pagination.page,
    limit: data.pagination.limit,
    totalPages: data.pagination.totalPages,
    hasNext: data.pagination.hasNext,
    hasPrev: data.pagination.hasPrev
  } : undefined

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
    setPage(1) // Reset to first page when searching
  }

  const onValueChange = (arg: { target: { value: string | number | boolean; name?: string } } | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange && 'target' in arg) {
      onChange({ target: { value: String(arg.target.value), name } })
    }
  }

  return (
    <FormPaginatedSelect
      labelText={labelText}
      value={value}
      onChange={onValueChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled || isLoading}
      options={options}
      pagination={pagination}
      onPageChange={handlePageChange}
      onSearchChange={handleSearchChange}
      isLoading={isLoading}
      errorText={error ? 'Failed to load students' : undefined}
      searchPlaceholder="Search students by name or admission number..."
    />
  )
}