'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Income, Expense } from '@/types';
import { Edit, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransactionForm } from './transaction-form';
import { format } from 'date-fns';

interface TransactionListProps {
  type: 'income' | 'expense';
  userId: string;
}

export function TransactionList({ type, userId }: TransactionListProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<any>(null);

  useEffect(() => {
    fetchTransactions();
  }, [type, userId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from(type === 'income' ? 'income' : 'expenses')
        .select(`
          *,
          categories!category_id (
            id,
            name,
            color
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      console.log('Fetched data:', data);

      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from(type === 'income' ? 'income' : 'expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEdit = (transaction: any) => {
    setEditTransaction(transaction);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchTransactions();
    setEditTransaction(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
        </h2>
        <Button onClick={() => setFormOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Tambah</span>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid gap-4">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          {transaction.categories && (
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: transaction.categories.color }}
                            />
                          )}
                          <span className="font-medium">
                            {transaction.categories?.name || 'Tanpa Kategori'}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(Number(transaction.amount))}
                        </div>
                        {type === 'income' && 'source' in transaction && (
                          <div className="text-sm text-muted-foreground">
                            Sumber: {transaction.source}
                          </div>
                        )}
                        {transaction.description && (
                          <div className="text-sm text-muted-foreground">
                            {transaction.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), 'dd MMMM yyyy')}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {!loading && transactions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-muted-foreground">
            Belum ada data {type === 'income' ? 'pemasukan' : 'pengeluaran'}
          </div>
        </motion.div>
      )}

      <TransactionForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditTransaction(null);
        }}
        type={type}
        userId={userId}
        transaction={editTransaction}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}