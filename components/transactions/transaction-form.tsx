'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import { motion } from 'framer-motion';

const transactionSchema = z.object({
  amount: z.string().min(1, 'Jumlah harus diisi'),
  categoryId: z.string().min(1, 'Kategori harus dipilih'),
  source: z.string().optional(),
  description: z.string().optional(),
  date: z.string().min(1, 'Tanggal harus diisi'),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'income' | 'expense';
  userId: string;
  transaction?: any;
  onSuccess: () => void;
}

export function TransactionForm({ 
  open, 
  onOpenChange, 
  type, 
  userId, 
  transaction, 
  onSuccess 
}: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const isEdit = !!transaction;

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: '',
      categoryId: '',
      source: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
      if (isEdit) {
        form.reset({
          amount: transaction.amount.toString(),
          categoryId: transaction.category_id || '',
          source: transaction.source || '',
          description: transaction.description || '',
          date: transaction.date,
        });
      } else {
        form.reset({
          amount: '',
          categoryId: '',
          source: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [open, isEdit, transaction, form]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('name');
    
    if (data) {
      setCategories(data);
    }
  };

  const onSubmit = async (data: TransactionForm) => {
    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        category_id: data.categoryId,
        amount: parseFloat(data.amount),
        description: data.description,
        date: data.date,
        ...(type === 'income' && { source: data.source }),
      };

      if (isEdit) {
        const { error } = await (supabase as any)
          .from(type === 'income' ? 'income' : 'expenses')
          .update(payload)
          .eq('id', transaction.id);
        
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from(type === 'income' ? 'income' : 'expenses')
          .insert(payload);
        
        if (error) throw error;
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit' : 'Tambah'} {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Perbarui' : 'Tambahkan'} data {type === 'income' ? 'pemasukan' : 'pengeluaran'} Anda
          </DialogDescription>
        </DialogHeader>
        
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              {...form.register('amount')}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Kategori</Label>
            <Select
              value={form.watch('categoryId')}
              onValueChange={(value) => form.setValue('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>

          {type === 'income' && (
            <div className="space-y-2">
              <Label htmlFor="source">Sumber</Label>
              <Input
                id="source"
                placeholder="Contoh: Gaji, Freelance, dll"
                {...form.register('source')}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Tambahkan keterangan..."
              {...form.register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              {...form.register('date')}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">
                {form.formState.errors.date.message}
              </p>
            )}
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