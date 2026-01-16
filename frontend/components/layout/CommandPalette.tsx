'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import '@/components/ui/command.css';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Briefcase, Users, BarChart3, Upload, GitBranch } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  type: 'job' | 'candidate' | 'page';
  id?: string;
  title: string;
  description?: string;
  href: string;
  icon: React.ReactNode;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Pages
  const pages: SearchResult[] = [
    {
      type: 'page',
      title: 'Command Center',
      description: 'Dashboard with KPIs and urgent actions',
      href: '/command-center',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      type: 'page',
      title: 'Job Architect',
      description: 'Create and configure job descriptions',
      href: '/job-architect',
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      type: 'page',
      title: 'Talent Ingest',
      description: 'Bulk upload resumes',
      href: '/talent-ingest',
      icon: <Upload className="h-4 w-4" />,
    },
    {
      type: 'page',
      title: 'Pipeline',
      description: 'Kanban board for hiring funnel',
      href: '/pipeline',
      icon: <GitBranch className="h-4 w-4" />,
    },
    {
      type: 'page',
      title: 'Analytics Studio',
      description: 'Data visualization and analysis',
      href: '/analytics',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      type: 'page',
      title: 'Candidates',
      description: 'View all candidates',
      href: '/candidates',
      icon: <Users className="h-4 w-4" />,
    },
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setResults([]);
      return;
    }

    if (search.length === 0) {
      setResults(pages);
      return;
    }

    setLoading(true);
    performSearch(search);
  }, [search, open]);

  const performSearch = async (query: string) => {
    const queryLower = query.toLowerCase();
    
    // Filter pages
    const pageResults = pages.filter(
      (page) =>
        page.title.toLowerCase().includes(queryLower) ||
        page.description?.toLowerCase().includes(queryLower)
    );

    // Search jobs
    let jobResults: SearchResult[] = [];
    try {
      const jobsResponse = await api.get('/jobs');
      jobResults = (jobsResponse.data || [])
        .filter((job: any) =>
          job.title.toLowerCase().includes(queryLower) ||
          job.description?.toLowerCase().includes(queryLower)
        )
        .slice(0, 5)
        .map((job: any) => ({
          type: 'job' as const,
          id: job.id,
          title: job.title,
          description: job.department || job.location,
          href: `/job-architect/${job.id}`,
          icon: <Briefcase className="h-4 w-4" />,
        }));
    } catch (error) {
      console.error('Failed to search jobs:', error);
    }

    // Search candidates
    let candidateResults: SearchResult[] = [];
    try {
      const candidatesResponse = await api.get('/candidates');
      candidateResults = (candidatesResponse.data || [])
        .filter((candidate: any) => {
          const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
          return (
            fullName.includes(queryLower) ||
            candidate.email?.toLowerCase().includes(queryLower)
          );
        })
        .slice(0, 5)
        .map((candidate: any) => ({
          type: 'candidate' as const,
          id: candidate.id,
          title: `${candidate.firstName} ${candidate.lastName}`,
          description: candidate.email,
          href: `/candidates/${candidate.id}`,
          icon: <Users className="h-4 w-4" />,
        }));
    } catch (error) {
      console.error('Failed to search candidates:', error);
    }

    setResults([...pageResults, ...jobResults, ...candidateResults]);
    setLoading(false);
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    setOpen(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-input]]:h-12">
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search jobs, candidates, or navigate..."
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            {loading && (
              <Command.Loading>Searching...</Command.Loading>
            )}
            <AnimatePresence>
              {results.map((result, index) => (
                <motion.div
                  key={`${result.type}-${result.id || result.href}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Command.Item
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-accent"
                  >
                    <div className="text-muted-foreground">{result.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.description && (
                        <div className="text-xs text-muted-foreground">
                          {result.description}
                        </div>
                      )}
                    </div>
                  </Command.Item>
                </motion.div>
              ))}
            </AnimatePresence>
            {!loading && results.length === 0 && search.length > 0 && (
              <Command.Empty>No results found.</Command.Empty>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
