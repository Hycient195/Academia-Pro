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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateDepartmentMutation } from '@/redux/api/school-admin/departmentApis';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import ErrorBlock from '@/components/utilities/ErrorBlock';
import ErrorToast from '@/components/utilities/ErrorToast';

const departmentTypes = [
  { value: 'administration', label: 'Administration' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'medical', label: 'Medical' },
  { value: 'counseling', label: 'Counseling' },
  { value: 'boarding', label: 'Boarding' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'catering', label: 'Catering' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'security', label: 'Security' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'HR' },
  { value: 'it', label: 'IT' },
  { value: 'library', label: 'Library' },
  { value: 'sports', label: 'Sports' },
  { value: 'arts', label: 'Arts' },
  { value: 'examinations', label: 'Examinations' },
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Department Type *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value as CreateDepartmentForm['type'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department type" />
              </SelectTrigger>
              <SelectContent>
                {departmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Department Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Mathematics Department"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the department's purpose and responsibilities..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

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