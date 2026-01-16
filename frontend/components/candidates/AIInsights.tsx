'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface AIInsightsProps {
  candidateId: string;
  aiSummary?: string | null;
}

export function AIInsights({ candidateId, aiSummary }: AIInsightsProps) {
  const [insights, setInsights] = useState<string | null>(aiSummary || null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateInsights = async () => {
    setGenerating(true);
    setLoading(true);
    try {
      const response = await api.post(`/candidates/${candidateId}/generate-insights`);
      setInsights(response.data.insights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Why this candidate is a good fit (GPT-4o analysis)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {insights}
          </motion.p>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No AI insights available yet
            </p>
            <button
              onClick={generateInsights}
              disabled={generating}
              className="text-sm text-primary hover:underline disabled:opacity-50"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                'Generate AI Insights'
              )}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
