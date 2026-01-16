'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sankey } from '@/components/analytics/SankeyChart';
import api from '@/lib/api';
import type { FunnelData } from '@/types/analytics';

interface HiringFunnelProps {
  jobId: string;
}

export function HiringFunnel({ jobId }: HiringFunnelProps) {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, [jobId]);

  const fetchFunnelData = async () => {
    try {
      const response = await api.get(`/analytics/funnel/${jobId}`);
      setFunnelData(response.data.funnel);
    } catch (error) {
      console.error('Failed to fetch funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (!funnelData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
          No funnel data available
        </CardContent>
      </Card>
    );
  }

  // Prepare Sankey diagram data
  const stages = [
    { name: 'Applied', value: funnelData.applied },
    { name: 'Screening', value: funnelData.screening },
    { name: 'Interview', value: funnelData.interview },
    { name: 'Offered', value: funnelData.offered },
    { name: 'Hired', value: funnelData.hired },
    { name: 'Rejected', value: funnelData.rejected },
  ];

  // Calculate drop-off rates
  const dropOffRates = [
    {
      from: 'Applied',
      to: 'Screening',
      value: funnelData.applied - funnelData.screening,
      rate: ((funnelData.applied - funnelData.screening) / Math.max(funnelData.applied, 1)) * 100,
    },
    {
      from: 'Screening',
      to: 'Interview',
      value: funnelData.screening - funnelData.interview,
      rate: ((funnelData.screening - funnelData.interview) / Math.max(funnelData.screening, 1)) * 100,
    },
    {
      from: 'Interview',
      to: 'Offered',
      value: funnelData.interview - funnelData.offered,
      rate: ((funnelData.interview - funnelData.offered) / Math.max(funnelData.interview, 1)) * 100,
    },
    {
      from: 'Offered',
      to: 'Hired',
      value: funnelData.offered - funnelData.hired,
      rate: ((funnelData.offered - funnelData.hired) / Math.max(funnelData.offered, 1)) * 100,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hiring Funnel (Sankey Diagram)</CardTitle>
        <CardDescription>
          Visualize candidate flow through the hiring pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sankey Visualization */}
          <div className="h-[500px]">
            <Sankey data={stages} />
          </div>

          {/* Drop-off Analysis */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dropOffRates.map((dropOff, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-border p-4"
              >
                <div className="text-sm text-muted-foreground">{dropOff.from} → {dropOff.to}</div>
                <div className="text-2xl font-bold mt-1">{dropOff.value}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {dropOff.rate.toFixed(1)}% drop-off
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stage Statistics */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="text-center"
              >
                <div className="text-2xl font-bold">{stage.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stage.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
