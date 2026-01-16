'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import type { SkillGapData } from '@/types/analytics';

interface SkillGapRadarProps {
  jobId: string;
  candidateId?: string;
}

export function SkillGapRadar({ jobId, candidateId }: SkillGapRadarProps) {
  const [skillGapData, setSkillGapData] = useState<SkillGapData[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | undefined>(candidateId);
  const [comparisonMode, setComparisonMode] = useState<'average' | 'specific'>('average');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillGap();
    fetchCandidates();
  }, [jobId, selectedCandidateId, comparisonMode]);

  const fetchSkillGap = async () => {
    try {
      const response = await api.get(`/analytics/skill-gap/${jobId}`);
      setSkillGapData(response.data.skillGap || []);
    } catch (error) {
      console.error('Failed to fetch skill gap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await api.get(`/candidates?jobId=${jobId}`);
      setCandidates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    }
  };

  // Prepare data for radar chart
  const radarData = skillGapData.map((item) => {
    let candidateValue = 0;
    
    if (comparisonMode === 'specific' && selectedCandidateId) {
      // Get specific candidate's skill match
      const candidate = candidates.find((c) => c.id === selectedCandidateId);
      if (candidate?.skills) {
        const hasSkill = candidate.skills.some((s: string | { name: string }) => {
          const skillName = typeof s === 'string' ? s : s.name;
          return skillName.toLowerCase().includes(item.skill.toLowerCase());
        });
        candidateValue = hasSkill ? 100 : 0;
      }
    } else {
      // Use average coverage
      candidateValue = item.coverage;
    }

    return {
      skill: item.skill,
      required: 100, // Job requirement is always 100%
      candidate: candidateValue,
    };
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Skill-Gap Radar</CardTitle>
            <CardDescription>
              Compare job requirements vs candidate profile
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={comparisonMode} onValueChange={(v: 'average' | 'specific') => setComparisonMode(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="specific">Specific Candidate</SelectItem>
              </SelectContent>
            </Select>
            {comparisonMode === 'specific' && (
              <Select value={selectedCandidateId || ''} onValueChange={setSelectedCandidateId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.firstName} {candidate.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Job Requirements"
                dataKey="required"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
              <Radar
                name={comparisonMode === 'average' ? 'Candidate Average' : 'Candidate Profile'}
                dataKey="candidate"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent))"
                fillOpacity={0.5}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No skill gap data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
