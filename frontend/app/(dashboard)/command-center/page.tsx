'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { TrendingUp, Users, Briefcase, Target, Clock, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import type { DashboardKPIs, UrgentAction } from '@/types/analytics';

export default function CommandCenterPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [urgentActions, setUrgentActions] = useState<UrgentAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setKpis(response.data.kpis);
      setUrgentActions(response.data.urgentActions || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Jobs',
      value: kpis?.totalJobs || 0,
      icon: Briefcase,
      trend: '+12%',
      color: 'text-blue-500',
    },
    {
      title: 'Total Candidates',
      value: kpis?.totalCandidates || 0,
      icon: Users,
      trend: '+8%',
      color: 'text-green-500',
    },
    {
      title: 'Hired',
      value: kpis?.hiredCount || 0,
      icon: CheckCircle2,
      trend: '+5%',
      color: 'text-purple-500',
    },
    {
      title: 'Active Jobs',
      value: kpis?.activeJobs || 0,
      icon: Target,
      trend: '+3%',
      color: 'text-orange-500',
    },
    {
      title: 'Hiring Velocity',
      value: kpis?.hiringVelocity || 0,
      icon: TrendingUp,
      trend: 'Last 30 days',
      color: 'text-cyan-500',
    },
    {
      title: 'Offer Acceptance',
      value: `${kpis?.offerAcceptanceRate || 0}%`,
      icon: Clock,
      trend: 'Rate',
      color: 'text-pink-500',
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
        <p className="text-muted-foreground mt-2">
          Real-time KPIs and urgent actions for your hiring pipeline
        </p>
      </div>

      {/* KPI Grid */}
      <motion.div
        variants={staggerContainer}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.title} variants={staggerItem}>
              <Card className="glass hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.trend}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Urgent Actions */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>Urgent Actions</CardTitle>
            <CardDescription>
              Items requiring your immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {urgentActions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No urgent actions at this time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className={`h-2 w-2 rounded-full mt-2 ${
                        action.priority === 'high'
                          ? 'bg-red-500'
                          : action.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {action.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(action.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pipeline Health */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Health</CardTitle>
            <CardDescription>Overall hiring pipeline metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pipeline Efficiency</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary to-primary/60"
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{kpis?.totalCandidates || 0}</div>
                  <div className="text-xs text-muted-foreground">In Pipeline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{kpis?.hiredCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Hired</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {kpis?.offerAcceptanceRate || 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Acceptance Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
