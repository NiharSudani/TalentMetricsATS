'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { BlindHiringToggle } from '@/components/candidates/BlindHiringToggle';
import { ScoreBreakdown } from '@/components/candidates/ScoreBreakdown';
import { AIInsights } from '@/components/candidates/AIInsights';
import type { Candidate, CandidateAnalysis } from '@/types/candidate';

export default function CandidateDeepDivePage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [analysis, setAnalysis] = useState<CandidateAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [blindHiring, setBlindHiring] = useState(false);

  useEffect(() => {
    fetchCandidateData();
  }, [candidateId]);

  const fetchCandidateData = async () => {
    try {
      const [candidateResponse, analysisResponse] = await Promise.all([
        api.get(`/candidates/${candidateId}`),
        api.get(`/candidates/${candidateId}/analysis`),
      ]);

      setCandidate(candidateResponse.data);
      setAnalysis(analysisResponse.data);
    } catch (error) {
      console.error('Failed to fetch candidate data:', error);
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

  if (!candidate) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Candidate not found</p>
      </div>
    );
  }

  const displayName = blindHiring
    ? `Candidate ${candidateId.slice(0, 8)}`
    : `${candidate.firstName} ${candidate.lastName}`;

  const displayEmail = blindHiring ? '***@***.***' : candidate.email;
  const displayPhone = blindHiring ? '***-***-****' : candidate.phone;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layoutId={`candidate-${candidateId}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
              <p className="text-muted-foreground mt-1">
                {candidate.status} • Applied {new Date(candidate.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <BlindHiringToggle value={blindHiring} onChange={setBlindHiring} />
        </div>

        {/* Score Overview */}
        {analysis?.scoreBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ScoreBreakdown breakdown={analysis.scoreBreakdown} />
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Candidate Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{displayEmail}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{displayPhone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{candidate.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => {
                      const skillName = typeof skill === 'string' ? skill : skill.name;
                      const proficiency = typeof skill === 'object' ? skill.proficiency_score : null;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Badge variant="secondary" className="px-3 py-1">
                            {skillName}
                            {proficiency && (
                              <span className="ml-2 text-xs opacity-70">
                                {Math.round(proficiency * 100)}%
                              </span>
                            )}
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Work Experience */}
            {candidate.workHistory && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.isArray(candidate.workHistory) &&
                    candidate.workHistory.map((work: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-l-2 border-primary pl-4"
                      >
                        <div className="font-medium">{work.role || work.title}</div>
                        <div className="text-sm text-muted-foreground">{work.company}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {work.startDate} - {work.endDate || 'Present'} • {work.duration}
                        </div>
                        {work.description && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {work.description}
                          </p>
                        )}
                      </motion.div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {candidate.education && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.isArray(candidate.education) &&
                    candidate.education.map((edu: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="font-medium">{edu.degree}</div>
                        <div className="text-sm text-muted-foreground">{edu.school}</div>
                        {edu.field && (
                          <div className="text-sm text-muted-foreground">{edu.field}</div>
                        )}
                        {edu.year && (
                          <div className="text-xs text-muted-foreground mt-1">{edu.year}</div>
                        )}
                      </motion.div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {candidate.certifications && candidate.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidate.certifications.map((cert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-sm"
                      >
                        {cert}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - AI Insights */}
          <div className="space-y-6">
            <AIInsights
              candidateId={candidateId}
              aiSummary={analysis?.analysis || candidate.aiSummary}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
