'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SkillGapRadar } from '@/components/analytics/SkillGapRadar';
import { HiringFunnel } from '@/components/analytics/HiringFunnel';
import { TalentHeatmap } from '@/components/analytics/TalentHeatmap';
import api from '@/lib/api';
import { staggerContainer } from '@/lib/animations';

export default function AnalyticsStudioPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      // Analytics will auto-refresh when job changes
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
      if (response.data.length > 0) {
        setSelectedJobId(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
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

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Studio</h1>
          <p className="text-muted-foreground mt-2">
            Data Analysis & Visualization for intelligent hiring decisions
          </p>
        </div>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a job" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Analytics Tabs */}
      {selectedJobId && (
        <Tabs defaultValue="skill-gap" className="space-y-4">
          <TabsList>
            <TabsTrigger value="skill-gap">Skill-Gap Radar</TabsTrigger>
            <TabsTrigger value="funnel">Hiring Funnel</TabsTrigger>
            <TabsTrigger value="heatmap">Talent Heatmap</TabsTrigger>
          </TabsList>

          <TabsContent value="skill-gap" className="space-y-4">
            <SkillGapRadar jobId={selectedJobId} candidateId={selectedCandidateId} />
          </TabsContent>

          <TabsContent value="funnel" className="space-y-4">
            <HiringFunnel jobId={selectedJobId} />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <TalentHeatmap jobId={selectedJobId} />
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
