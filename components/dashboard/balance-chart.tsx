'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

interface BalanceChartProps {
  userId: string;
}

interface ChartData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export function BalanceChart({ userId }: BalanceChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        const endDate = new Date();
        const startDate = subMonths(endDate, 11); // Last 12 months
        
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        
        const chartData: ChartData[] = [];
        
        for (const month of months) {
          const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
          const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');
          
          // Get income for this month
          const { data: incomeData } = await supabase
            .from('income')
            .select('amount')
            .eq('user_id', userId)
            .gte('date', monthStart)
            .lte('date', monthEnd);
          
          // Get expenses for this month
          const { data: expensesData } = await supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', userId)
            .gte('date', monthStart)
            .lte('date', monthEnd);
          
          const monthlyIncome = incomeData?.reduce((sum, item: any) => sum + Number(item.amount), 0) || 0;
          const monthlyExpenses = expensesData?.reduce((sum, item: any) => sum + Number(item.amount), 0) || 0;
          
          chartData.push({
            month: format(month, 'MMM yyyy'),
            income: monthlyIncome,
            expenses: monthlyExpenses,
            balance: monthlyIncome - monthlyExpenses,
          });
        }
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching balance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceData();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perkembangan Saldo Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Perkembangan Saldo Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-muted-foreground">📊</div>
              <div className="text-muted-foreground">Chart akan segera tersedia</div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {data.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground">{item.month}</div>
                    <div className="text-sm font-medium text-emerald-600">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        notation: 'compact',
                        maximumFractionDigits: 0,
                      }).format(item.balance)}
                    </div>
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