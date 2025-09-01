'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface ExpenseChartProps {
  userId: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export function ExpenseChart({ userId }: ExpenseChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpensesByCategory = async () => {
      try {
        const { data: expenses } = await supabase
          .from('expenses')
          .select(`
            amount,
            categories (
              name,
              color
            )
          `)
          .eq('user_id', userId);

        if (expenses) {
          const categoryTotals = expenses.reduce((acc: Record<string, any>, expense: any) => {
            const categoryName = expense.categories?.name || 'Tanpa Kategori';
            const categoryColor = expense.categories?.color || '#6B7280';
            
            if (!acc[categoryName]) {
              acc[categoryName] = {
                name: categoryName,
                value: 0,
                color: categoryColor,
              };
            }
            acc[categoryName].value += Number(expense.amount);
            return acc;
          }, {});

          setData(Object.values(categoryTotals));
        }
      } catch (error) {
        console.error('Error fetching expense data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpensesByCategory();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Belum ada data pengeluaran
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-muted-foreground">🍰</div>
              <div className="text-muted-foreground">Chart akan segera tersedia</div>
              <div className="space-y-2 mt-6">
                {data.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        notation: 'compact',
                        maximumFractionDigits: 0,
                      }).format(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}