'use client';

import { useAuth } from '@/hooks/use-auth';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { BalanceChart } from '@/components/dashboard/balance-chart';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats(user?.id);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Ringkasan keuangan pribadi Anda
          </p>
        </div>

        <StatsCards stats={stats} loading={statsLoading} />

        {user?.id && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ExpenseChart userId={user.id} />
            <BalanceChart userId={user.id} />
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}