'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ScoreBreakdownProps {
  breakdown: {
    overall: number | null;
    skills: number | null;
    experience: number | null;
    certifications: number | null;
    vectorSimilarity?: number | null;
  };
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const scores = [
    {
      label: 'Overall Score',
      value: breakdown.overall || 0,
      color: 'bg-primary',
    },
    {
      label: 'Skills Match',
      value: breakdown.skills || 0,
      color: 'bg-blue-500',
    },
    {
      label: 'Experience Match',
      value: breakdown.experience || 0,
      color: 'bg-green-500',
    },
    {
      label: 'Certifications',
      value: breakdown.certifications || 0,
      color: 'bg-purple-500',
    },
    ...(breakdown.vectorSimilarity
      ? [
          {
            label: 'Vector Similarity',
            value: breakdown.vectorSimilarity,
            color: 'bg-orange-500',
          },
        ]
      : []),
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {scores.map((score, index) => (
            <motion.div
              key={score.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{score.label}</span>
                <span className="text-lg font-bold">{score.value.toFixed(1)}%</span>
              </div>
              <Progress value={score.value} className="h-2" />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
