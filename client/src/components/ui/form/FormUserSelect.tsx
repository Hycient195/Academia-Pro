"use client"

import React, { useState } from 'react'
import { FormPaginatedSelect } from './form-components'
import { IUserFilters } from '@academia-pro/types/super-admin'
import { ISuperAdminUser } from '@academia-pro/types/super-admin'
import { apis } from '@/redux/api'

interface FormUserSelectProps {
  labelText?: string
  value?: string
  name?: string
  // onChange?: (value: string | number | boolean) => void
  onChange?: (arg: { target: { value: string; name?: string } } | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export const FormUserSelect: React.FC<FormUserSelectProps> = ({
  labelText = "Select User",
  value,
  onChange,
  placeholder = "Choose a user",
  required,
  disabled,
  name
}) => {
  const [filters, setFilters] = useState<IUserFilters & { page?: number; limit?: number }>({
    page: 1,
    limit: 10,
  })

  const { data, isLoading, error } = apis.superAdmin.useGetAllUsersQuery(filters)

  const apiOptions = data?.data?.map((user: ISuperAdminUser) => ({
    value: user.id,
    text: user.name || `${user.firstName} ${user.lastName}`,
  })) || []

  // Ensure selected value is always available in options
  const selectedUser = data?.data?.find(user => user.id === value)
  const options = selectedUser && !apiOptions.find(opt => opt.value === value)
    ? [{ value: selectedUser.id, text: selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}` }, ...apiOptions]
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
      errorText={error ? 'Failed to load users' : undefined}
    />
  )
}