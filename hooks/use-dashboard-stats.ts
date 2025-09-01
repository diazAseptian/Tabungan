'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardStats } from '@/types';

// Cache untuk menyimpan data sementara
const cache = new Map<string, { data: DashboardStats; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

export function useDashboardStats(userId: string | undefined) {
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
  });
  const [loading, setLoading] = useState(true);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
  }, []);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Check cache
    const cacheKey = `${userId}-${currentMonth.year}-${currentMonth.month}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setStats(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const monthStart = `${currentMonth.year}-${currentMonth.month.toString().padStart(2, '0')}-01`;
      const nextMonth = currentMonth.month === 12 ? 1 : currentMonth.month + 1;
      const nextYear = currentMonth.month === 12 ? currentMonth.year + 1 : currentMonth.year;
      const monthEnd = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;

      // Fetch all data in parallel
      const [incomeResult, expensesResult, monthlyIncomeResult, monthlyExpensesResult] = await Promise.all([
        supabase.from('income').select('amount').eq('user_id', userId),
        supabase.from('expenses').select('amount').eq('user_id', userId),
        supabase.from('income').select('amount').eq('user_id', userId).gte('date', monthStart).lt('date', monthEnd),
        supabase.from('expenses').select('amount').eq('user_id', userId).gte('date', monthStart).lt('date', monthEnd)
      ]);

      const totalIncome = incomeResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExpenses = expensesResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const monthlyIncome = monthlyIncomeResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const monthlyExpenses = monthlyExpensesResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      const newStats = {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses,
      };

      // Cache the result
      cache.set(cacheKey, { data: newStats, timestamp: Date.now() });
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, currentMonth]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}