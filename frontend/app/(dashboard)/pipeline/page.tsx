'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { staggerContainer } from '@/lib/animations';

const columns = [
  { id: 'APPLIED', title: 'Applied', color: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'SCREENING', title: 'Screening', color: 'bg-yellow-500/10 border-yellow-500/20' },
  { id: 'INTERVIEW', title: 'Interview', color: 'bg-purple-500/10 border-purple-500/20' },
  { id: 'OFFERED', title: 'Offered', color: 'bg-green-500/10 border-green-500/20' },
  { id: 'HIRED', title: 'Hired', color: 'bg-emerald-500/10 border-emerald-500/20' },
  { id: 'REJECTED', title: 'Rejected', color: 'bg-red-500/10 border-red-500/20' },
];

export default function PipelinePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [pipeline, setPipeline] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchPipeline(selectedJobId);
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

  const fetchPipeline = async (jobId: string) => {
    try {
      const response = await api.get(`/pipeline/${jobId}`);
      setPipeline(response.data);
    } catch (error) {
      console.error('Failed to fetch pipeline:', error);
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
          <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground mt-2">
            Manage candidates through the hiring funnel
          </p>
        </div>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-[250px]">
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

      {/* Kanban Board */}
      <div className="grid grid-cols-6 gap-4">
        {columns.map((column) => {
          const applications = pipeline[column.id] || [];
          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col"
            >
              <Card className={`${column.color} h-full`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {column.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {applications.length} candidates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {applications.map((app: any) => (
                    <Link
                      key={app.id}
                      href={`/candidates/${app.candidateId}`}
                      className="block"
                    >
                      <motion.div
                        layoutId={`candidate-${app.candidateId}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <div className="font-medium text-sm">
                          {app.candidate?.firstName} {app.candidate?.lastName}
                        </div>
                        {app.overallScore && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Score: {app.overallScore.toFixed(1)}%
                          </div>
                        )}
                        {app.vectorSimilarity && (
                          <div className="text-xs text-muted-foreground">
                            Vector: {(app.vectorSimilarity * 100).toFixed(1)}%
                          </div>
                        )}
                      </motion.div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
