'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useDropzone } from 'react-dropzone';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function TalentIngestPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  
  // WebSocket for real-time progress
  const { progress: wsProgress, completed: wsCompleted, connected } = useWebSocket(selectedJobId);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!selectedJobId) {
        alert('Please select a job first');
        return;
      }

      setUploading(true);
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('jobId', selectedJobId);

      try {
        const response = await api.post('/upload/bulk', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setUploadResults(response.data.results || []);
        // WebSocket will handle progress updates
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [selectedJobId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      }
    };
    fetchJobs();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Talent Ingest Lab</h1>
        <p className="text-muted-foreground mt-2">
          Bulk upload resumes for AI-powered parsing and scoring
        </p>
      </div>

      {/* Job Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Job</CardTitle>
          <CardDescription>Choose the job posting for these resumes</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-full">
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
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Resumes</CardTitle>
          <CardDescription>
            Drag and drop PDF files or click to browse. Supports bulk upload of 10,000+ files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop files here...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Drag & drop PDF resumes here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to select files
                </p>
              </>
            )}
          </div>

          {/* Real-time Progress from WebSocket */}
          {Object.keys(wsProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Processing resumes... {connected ? '🟢' : '🔴'}
                </span>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {Object.values(wsProgress).map((prog) => (
                  <div key={prog.candidateId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {prog.message || `Processing ${prog.candidateId.slice(0, 8)}...`}
                      </span>
                      <span className="font-medium">{prog.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${prog.progress}%` }}
                        className={`h-full ${
                          prog.status === 'COMPLETED'
                            ? 'bg-green-500'
                            : prog.status === 'FAILED'
                            ? 'bg-red-500'
                            : 'bg-primary'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && Object.keys(wsProgress).length === 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Uploading files...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WebSocket Completion */}
      {wsCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Processed: {wsCompleted.totalProcessed}</span>
              </div>
              {wsCompleted.totalFailed > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Failed: {wsCompleted.totalFailed}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && !wsCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm"
                >
                  {result.success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Successfully processed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Failed: {result.error || 'Unknown error'}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
