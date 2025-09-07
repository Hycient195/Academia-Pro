"use client"

import React, { useState } from 'react'
import { FormPaginatedSelect } from './form-components'
import { ISchoolFilters } from '@academia-pro/types/shared'
import { ISuperAdminSchool } from '@academia-pro/types/super-admin'
import { useGetAllSchoolsQuery, useGetSchoolByIdQuery } from '@/redux/api/schoolsApi'

interface FormSchoolSelectProps {
  labelText?: string
  value?: string
  name?: string
  // onChange?: (value: string | number | boolean) => void
  onChange?: (arg: { target: { value: string; name?: string } } | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export const FormSchoolSelect: React.FC<FormSchoolSelectProps> = ({
  labelText = "Select School",
  value,
  onChange,
  placeholder = "Choose a school",
  required,
  disabled,
  name
}) => {
  const [filters, setFilters] = useState<ISchoolFilters & { page?: number; limit?: number }>({
    page: 1,
    limit: 10,
  })

  const { data, isLoading, error } = useGetAllSchoolsQuery(filters)

  // Fetch selected school separately if it's not in the current page
  const { data: selectedSchoolData } = useGetSchoolByIdQuery(value || '', {
    skip: !value || !!data?.data?.find(school => school.id === value)
  })

  const apiOptions = data?.data?.map((school: ISuperAdminSchool) => ({
    value: school.id,
    text: school.name,
  })) || []

  // Ensure selected value is always available in options
  const selectedSchool = data?.data?.find(school => school.id === value) || selectedSchoolData
  const options = selectedSchool && !apiOptions.find(opt => opt.value === value)
    ? [{ value: selectedSchool.id, text: selectedSchool.name }, ...apiOptions]
    : apiOptions

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }))
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
      pagination={data?.pagination}
      onPageChange={handlePageChange}
      onSearchChange={handleSearchChange}
      isLoading={isLoading}
      errorText={error ? 'Failed to load schools' : undefined}
    />
  )
}