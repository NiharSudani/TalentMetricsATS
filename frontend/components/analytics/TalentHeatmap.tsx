'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import type { HeatmapData } from '@/types/analytics';

interface TalentHeatmapProps {
  jobId: string;
}

export function TalentHeatmap({ jobId }: TalentHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmapData();
  }, [jobId]);

  const fetchHeatmapData = async () => {
    try {
      const response = await api.get(`/analytics/heatmap/${jobId}`);
      const data = response.data.heatmap || [];
      
      // Transform data for scatter plot (use PCA/TSNE coordinates if available)
      const transformedData = data.map((item: any) => {
        // Use PCA coordinates if available, otherwise use score and experience
        const x = item.pcaCoordinates?.x || item.tsneCoordinates?.x || (item.score || 0);
        const y = item.pcaCoordinates?.y || item.tsneCoordinates?.y || (item.experience || 0);
        
        return {
          x,
          y,
          z: item.score || 0,
          id: item.id,
          skills: item.skills || [],
          experience: item.experience || 0,
          vectorSimilarity: item.vectorSimilarity || 0,
        };
      });
      
      setHeatmapData(transformedData);
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[500px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  // Color mapping based on score
  const getColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const scatterData = heatmapData.map((item) => ({
    ...item,
    fill: getColor(item.z),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Talent Cluster Heatmap</CardTitle>
        <CardDescription>
          2D visualization of candidate competency clusters using PCA/T-SNE
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scatterData.length > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Component 1"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Component 2"
                  stroke="hsl(var(--muted-foreground))"
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Score" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                          <p className="font-medium">Score: {data.z.toFixed(1)}%</p>
                          <p className="text-sm text-muted-foreground">
                            Experience: {data.experience} years
                          </p>
                          {data.vectorSimilarity > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Vector Similarity: {(data.vectorSimilarity * 100).toFixed(1)}%
                            </p>
                          )}
                          {data.skills && data.skills.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Skills: {data.skills.slice(0, 3).join(', ')}
                              {data.skills.length > 3 && '...'}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Candidates" data={scatterData} fill="hsl(var(--primary))">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Low (0-40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>Medium (40-60%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Good (60-80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Excellent (80-100%)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[500px] text-muted-foreground">
            No heatmap data available. Upload candidates to see clusters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
