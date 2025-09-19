'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormText, FormSelect, FormTextArea } from '@/components/ui/form/form-components';
import { useCreateDepartmentMutation } from '@/redux/api/school-admin/departmentApis';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import ErrorBlock from '@/components/utilities/ErrorBlock';
import ErrorToast from '@/components/utilities/ErrorToast';

const departmentTypes = [
  { value: 'administration', text: 'Administration' },
  { value: 'teaching', text: 'Teaching' },
  { value: 'medical', text: 'Medical' },
  { value: 'counseling', text: 'Counseling' },
  { value: 'boarding', text: 'Boarding' },
  { value: 'transportation', text: 'Transportation' },
  { value: 'catering', text: 'Catering' },
  { value: 'facilities', text: 'Facilities' },
  { value: 'security', text: 'Security' },
  { value: 'finance', text: 'Finance' },
  { value: 'hr', text: 'HR' },
  { value: 'it', text: 'IT' },
  { value: 'library', text: 'Library' },
  { value: 'sports', text: 'Sports' },
  { value: 'arts', text: 'Arts' },
  { value: 'examinations', text: 'Examinations' },
];

const createDepartmentSchema = z.object({
  type: z.enum([
    'administration', 'teaching', 'medical', 'counseling', 'boarding',
    'transportation', 'catering', 'facilities', 'security', 'finance',
    'hr', 'it', 'library', 'sports', 'arts', 'examinations'
  ]),
  name: z.string().min(1, 'Department name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
});

type CreateDepartmentForm = z.infer<typeof createDepartmentSchema>;

interface CreateDepartmentModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateDepartmentModal({ open, onClose }: CreateDepartmentModalProps) {
  const [createDepartment, { isLoading, error }] = useCreateDepartmentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateDepartmentForm>({
    resolver: zodResolver(createDepartmentSchema),
  });

  const selectedType = watch('type');

  const onSubmit = async (data: CreateDepartmentForm) => {
    try {
      await createDepartment(data).unwrap();
      toast.success('Department created successfully');
      reset();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      toast.error('Failed to create department', { description: <ErrorToast error={error} /> });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Department</DialogTitle>
          <DialogDescription>
            Add a new department to your school. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col gap-">
          <FormText
            labelText="Department Name *"
            name="name"
            value={watch('name') || ''}
            onChange={(e) => setValue('name', String(e.target.value))}
            placeholder="e.g., Mathematics Department"
            required
            errorText={errors.name?.message}
          />

          <FormSelect
            labelText="Department Type *"
            name="type"
            value={selectedType || ''}
            onChange={(e) => setValue('type', String(e.target.value) as CreateDepartmentForm['type'])}
            placeholder="Select department type"
            options={departmentTypes}
            required
            errorText={errors.type?.message}
          />

          <FormTextArea
            labelText="Description"
            name="description"
            value={watch('description') || ''}
            onChange={(e) => setValue('description', String(e.target.value) || undefined)}
            placeholder="Brief description of the department's purpose and responsibilities..."
            rows={3}
            errorText={errors.description?.message}
          />

          <ErrorBlock error={error} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}