'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeightingEngine } from '@/components/job-architect/WeightingEngine';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Plus, X } from 'lucide-react';
import api from '@/lib/api';
import type { Job, JobWeights, JobStatus } from '@/types/job';

export default function JobArchitectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    description: '',
    department: '',
    location: '',
    status: 'DRAFT' as JobStatus,
    requiredSkills: [],
    requiredExperience: undefined,
    requiredCerts: [],
    skillsWeight: 0.6,
    experienceWeight: 0.3,
    certsWeight: 0.1,
  });

  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');

  const handleWeightsChange = (weights: JobWeights) => {
    setFormData({
      ...formData,
      skillsWeight: weights.skills,
      experienceWeight: weights.experience,
      certsWeight: weights.certifications,
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills?.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...(formData.requiredSkills || []), skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills?.filter((s) => s !== skill) || [],
    });
  };

  const addCert = () => {
    if (certInput.trim() && !formData.requiredCerts?.includes(certInput.trim())) {
      setFormData({
        ...formData,
        requiredCerts: [...(formData.requiredCerts || []), certInput.trim()],
      });
      setCertInput('');
    }
  };

  const removeCert = (cert: string) => {
    setFormData({
      ...formData,
      requiredCerts: formData.requiredCerts?.filter((c) => c !== cert) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/jobs', {
        ...formData,
        createdBy: 'system', // TODO: Get from auth context
      });

      router.push(`/job-architect/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Architect</h1>
        <p className="text-muted-foreground mt-2">
          Create and configure job descriptions with AI-powered scoring weights
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Job title, description, and location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Frontend Engineer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Engineering"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as JobStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Requirements */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>Skills, experience, and certifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Skills */}
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="e.g., React, TypeScript, Node.js"
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.requiredSkills?.map((skill) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-primary/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience">Required Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.requiredExperience || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiredExperience: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="e.g., 5"
                />
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <Label>Required Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCert();
                      }
                    }}
                    placeholder="e.g., AWS Certified Solutions Architect"
                  />
                  <Button type="button" onClick={addCert} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.requiredCerts?.map((cert) => (
                    <motion.span
                      key={cert}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCert(cert)}
                        className="hover:text-primary/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weighting Engine */}
        <motion.div variants={staggerItem}>
          <WeightingEngine
            initialWeights={{
              skills: formData.skillsWeight || 0.6,
              experience: formData.experienceWeight || 0.3,
              certifications: formData.certsWeight || 0.1,
            }}
            onChange={handleWeightsChange}
          />
        </motion.div>

        {/* Submit */}
        <motion.div variants={staggerItem} className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Job'}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
