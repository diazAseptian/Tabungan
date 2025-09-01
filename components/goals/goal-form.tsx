'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { Goal } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';

const goalSchema = z.object({
  name: z.string().min(1, 'Nama target harus diisi'),
  targetAmount: z.number().min(1, 'Target jumlah harus diisi'),
  currentAmount: z.number().min(0, 'Jumlah saat ini tidak boleh negatif'),
  deadline: z.string().optional(),
});

type GoalForm = z.infer<typeof goalSchema>;

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  goal?: Goal | null;
  onSuccess: () => void;
}

export function GoalForm({ open, onOpenChange, userId, goal, onSuccess }: GoalFormProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!goal;

  const form = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit && goal) {
        form.reset({
          name: goal.name,
          targetAmount: Number(goal.target_amount),
          currentAmount: Number(goal.current_amount),
          deadline: goal.deadline || '',
        });
      } else {
        form.reset({
          name: '',
          targetAmount: 0,
          currentAmount: 0,
          deadline: '',
        });
      }
    }
  }, [open, isEdit, goal, form]);

  const onSubmit = async (data: GoalForm) => {
    setLoading(true);
    try {
      const payload: any = {
        user_id: userId,
        name: data.name,
        target_amount: data.targetAmount,
        current_amount: data.currentAmount,
        deadline: data.deadline || null,
        updated_at: new Date().toISOString(),
      };

      if (isEdit && goal) {
        const { error } = await supabase
          .from('goals')
          .update(payload)
          .eq('id', goal.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('goals')
          .insert(payload);
        
        if (error) throw error;
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Target' : 'Tambah Target Tabungan'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Perbarui' : 'Buat'} target tabungan untuk mencapai tujuan finansial Anda
          </DialogDescription>
        </DialogHeader>
        
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nama Target</Label>
            <Input
              id="name"
              placeholder="Contoh: Beli laptop baru"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Jumlah (Rp)</Label>
            <Input
              id="targetAmount"
              type="number"
              placeholder="10000000"
              {...form.register('targetAmount')}
            />
            {form.formState.errors.targetAmount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.targetAmount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentAmount">Jumlah Saat Ini (Rp)</Label>
            <Input
              id="currentAmount"
              type="number"
              placeholder="0"
              {...form.register('currentAmount')}
            />
            {form.formState.errors.currentAmount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.currentAmount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Opsional)</Label>
            <Input
              id="deadline"
              type="date"
              {...form.register('deadline')}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Simpan'}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}