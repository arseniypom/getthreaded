'use client';

import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThreadsDataTable, ThreadsPostData } from '@/components/threads-data-table';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Analytics() {
  const [handle, setHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<ThreadsPostData[]>([]);
  const [error, setError] = useState<string>('');

  const handleAnalyze = async () => {
    if (!handle.trim()) {
      setError('Please enter a Threads profile URL or handle');
      return;
    }

    setIsLoading(true);
    setError('');
    setPosts([]);

    try {
      const response = await fetch('/api/scrape-threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handle: handle.trim(),
          limit: 30,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze profile');
      }

      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleAnalyze();
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="max-w-6xl mx-auto w-full space-y-6">
          <header className="text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Threads Analytics
            </h1>
            <p className="text-muted-foreground">
              Analyze any public Threads profile to see their last 30 posts and engagement metrics
            </p>
          </header>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Analyze Profile</CardTitle>
              <CardDescription>
                Enter a Threads profile URL or handle (e.g., @username or https://threads.net/@username)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="@username or profile URL"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <Button onClick={handleAnalyze} disabled={isLoading || !handle.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {posts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Post Analytics</CardTitle>
                <CardDescription>
                  {posts.length} posts found. Click column headers to sort.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThreadsDataTable data={posts} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}