'use client';

import { useEffect } from 'react';
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
import { useUpdateDepartmentMutation } from '@/redux/api/school-admin/departmentApis';
import { IDepartment } from '@academia-pro/types/school-admin';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import ErrorToast from '@/components/utilities/ErrorToast';
import ErrorBlock from '@/components/utilities/ErrorBlock';

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

const updateDepartmentSchema = z.object({
  type: z.enum([
    'administration', 'teaching', 'medical', 'counseling', 'boarding',
    'transportation', 'catering', 'facilities', 'security', 'finance',
    'hr', 'it', 'library', 'sports', 'arts', 'examinations'
  ]),
  name: z.string().min(1, 'Department name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
});

type UpdateDepartmentForm = z.infer<typeof updateDepartmentSchema>;

interface EditDepartmentModalProps {
  open: boolean;
  onClose: () => void;
  department: IDepartment;
}

export function EditDepartmentModal({ open, onClose, department }: EditDepartmentModalProps) {
  const [updateDepartment, { isLoading, error }] = useUpdateDepartmentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateDepartmentForm>({
    resolver: zodResolver(updateDepartmentSchema),
    defaultValues: {
      type: department.type,
      name: department.name,
      description: department.description || '',
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (open && department) {
      reset({
        type: department.type,
        name: department.name,
        description: department.description || '',
      });
    }
  }, [open, department, reset]);

  const onSubmit = async (data: UpdateDepartmentForm) => {
    try {
      await updateDepartment({
        id: department.id,
        data,
      }).unwrap();
      toast.success('Department updated successfully');
      onClose();
    } catch (error: unknown) {
      console.error(error);
      toast.error('Failed to update department', { description: <ErrorToast error={error} /> });
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
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update the department information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
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
            onChange={(e) => setValue('type', String(e.target.value) as UpdateDepartmentForm['type'])}
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
              Update Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}