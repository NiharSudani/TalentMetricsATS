'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { JobWeights } from '@/types/job';

interface WeightingEngineProps {
  initialWeights?: JobWeights;
  onChange: (weights: JobWeights) => void;
}

export function WeightingEngine({ initialWeights, onChange }: WeightingEngineProps) {
  const [weights, setWeights] = useState<JobWeights>(
    initialWeights || {
      skills: 0.6,
      experience: 0.3,
      certifications: 0.1,
    }
  );

  useEffect(() => {
    onChange(weights);
  }, [weights, onChange]);

  const updateWeight = (key: keyof JobWeights, value: number[]) => {
    const newWeights = { ...weights, [key]: value[0] / 100 };
    
    // Normalize to ensure sum = 1.0
    const total = newWeights.skills + newWeights.experience + newWeights.certifications;
    if (total > 0) {
      newWeights.skills = newWeights.skills / total;
      newWeights.experience = newWeights.experience / total;
      newWeights.certifications = newWeights.certifications / total;
    }
    
    setWeights(newWeights);
  };

  const total = (weights.skills + weights.experience + weights.certifications) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Scoring Weighting Engine</CardTitle>
        <CardDescription>
          Adjust weights to influence how candidates are scored. Total must equal 100%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="skills-weight">Skills Match</Label>
            <span className="text-sm font-medium text-primary">
              {Math.round(weights.skills * 100)}%
            </span>
          </div>
          <Slider
            id="skills-weight"
            value={[weights.skills * 100]}
            onValueChange={(value) => updateWeight('skills', value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Weight for semantic skills matching using embeddings
          </p>
        </div>

        {/* Experience Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="experience-weight">Experience Match</Label>
            <span className="text-sm font-medium text-primary">
              {Math.round(weights.experience * 100)}%
            </span>
          </div>
          <Slider
            id="experience-weight"
            value={[weights.experience * 100]}
            onValueChange={(value) => updateWeight('experience', value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Weight for years of experience matching
          </p>
        </div>

        {/* Certifications Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="certs-weight">Certifications Match</Label>
            <span className="text-sm font-medium text-primary">
              {Math.round(weights.certifications * 100)}%
            </span>
          </div>
          <Slider
            id="certs-weight"
            value={[weights.certifications * 100]}
            onValueChange={(value) => updateWeight('certifications', value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Weight for certifications and credentials matching
          </p>
        </div>

        {/* Total Display */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Weight</span>
            <span
              className={`text-lg font-bold ${
                Math.abs(total - 100) < 0.1 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {total.toFixed(1)}%
            </span>
          </div>
          {Math.abs(total - 100) >= 0.1 && (
            <p className="text-xs text-red-500 mt-1">
              Weights must sum to 100%
            </p>
          )}
        </div>

        {/* Formula Display */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-mono text-muted-foreground">
            Score = (S_match × {weights.skills.toFixed(2)}) + (E_match ×{' '}
            {weights.experience.toFixed(2)}) + (C_match ×{' '}
            {weights.certifications.toFixed(2)})
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
