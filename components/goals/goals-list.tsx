'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { Goal } from '@/types';
import { Edit, Trash2, Plus, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoalForm } from './goal-form';
import { format } from 'date-fns';

interface GoalsListProps {
  userId: string;
}

export function GoalsList({ userId }: GoalsListProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditGoal(goal);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchGoals();
    setEditGoal(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Target Tabungan</h2>
        <Button onClick={() => setFormOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Target</span>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, index) => {
              const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
              const isCompleted = progress >= 100;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`hover:shadow-lg transition-all duration-200 ${
                    isCompleted ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Target className={`h-5 w-5 ${isCompleted ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                          <span>{goal.name}</span>
                        </CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(goal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(goal.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Saat ini</span>
                          <span className="font-medium">{formatCurrency(goal.current_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Target</span>
                          <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
                        </div>
                        {goal.deadline && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Deadline</span>
                            <span className="font-medium">
                              {format(new Date(goal.deadline), 'dd MMM yyyy')}
                            </span>
                          </div>
                        )}
                      </div>

                      {isCompleted && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg text-center"
                        >
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                            🎉 Target tercapai!
                          </span>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {!loading && goals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-muted-foreground">
            Belum ada target tabungan. Mulai buat target pertama Anda!
          </div>
        </motion.div>
      )}

      <GoalForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditGoal(null);
        }}
        userId={userId}
        goal={editGoal}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}