'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Search, AlertCircle, RefreshCw, Clock, Trash2, History, User, X, TrendingUp, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProfileHistory } from '@/hooks/useProfileHistory';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRelativeTime } from '@/lib/format-time';

export default function Insights() {
  const [handle, setHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<ThreadsPostData[]>([]);
  const [error, setError] = useState<string>('');
  const [currentHandle, setCurrentHandle] = useState<string>('');
  const [refreshCountdown, setRefreshCountdown] = useState<number>(0);

  const {
    history,
    saveProfile,
    getCachedProfile,
    canRefresh,
    clearHistory,
    removeEntry,
  } = useProfileHistory();

  // Update countdown timer
  useEffect(() => {
    if (refreshCountdown > 0) {
      const timer = setTimeout(() => {
        setRefreshCountdown(prev => prev - 1000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [refreshCountdown]);

  const fetchProfile = async (profileHandle: string, forceRefresh = false) => {
    const normalizedHandle = profileHandle.trim();

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cached = getCachedProfile(normalizedHandle);
      if (cached) {
        setPosts(cached.posts);
        setCurrentHandle(normalizedHandle);
        setHandle(normalizedHandle);
        return;
      }
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
          handle: normalizedHandle,
          limit: 30,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze profile');
      }

      setPosts(data.posts);
      setCurrentHandle(normalizedHandle);

      // Save to history
      saveProfile(normalizedHandle, data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!handle.trim()) {
      setError('Please enter a Threads profile URL or handle');
      return;
    }
    await fetchProfile(handle);
  };

  const handleRefresh = async () => {
    if (!currentHandle) return;

    const refreshCheck = canRefresh(currentHandle);
    if (!refreshCheck.allowed) {
      setRefreshCountdown(refreshCheck.remainingMs || 0);
      return;
    }

    await fetchProfile(currentHandle, true);
  };

  const handleSelectHistory = async (profileHandle: string) => {
    await fetchProfile(profileHandle);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleAnalyze();
    }
  };

  const formatCountdown = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <TooltipProvider>
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
                <BreadcrumbPage>Insights</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="max-w-6xl mx-auto w-full space-y-6">
            <header className="text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Threads Insights
              </h1>
              <p className="text-muted-foreground">
                Discover top-performing content from any public Threads profile
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
                    className="flex-1"
                  />

                  {/* History Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={history.length === 0}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel className="flex items-center justify-between">
                        Recent Profiles
                        {history.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearHistory}
                            className="h-auto p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {history.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No recent profiles
                        </div>
                      ) : (
                        history.map((entry) => (
                          <DropdownMenuItem
                            key={entry.handle}
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => handleSelectHistory(entry.handle)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <User className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {entry.displayName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {entry.posts.length} posts
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEntry(entry.handle);
                              }}
                              className="h-auto p-0 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

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

            {/* Show recent searches when no table is visible */}
            {posts.length === 0 && history.length > 0 && !isLoading && (
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Searches
                  </CardTitle>
                  <CardDescription>
                    Click on any profile to view cached results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {history.map((entry) => {
                      const isStale = Date.now() - entry.timestamp > 15 * 60 * 1000; // 15 minutes
                      return (
                        <div
                          key={entry.handle}
                          className="group relative flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => handleSelectHistory(entry.handle)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">
                                  {entry.displayName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  @{entry.displayName}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {entry.posts.length} posts
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatRelativeTime(entry.timestamp)}
                                </span>
                                {isStale && (
                                  <span className="text-orange-500">
                                    • Cache expiring soon
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEntry(entry.handle);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  {history.length > 3 && (
                    <div className="mt-4 pt-4 border-t text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Clear All History
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {posts.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Post Analytics</CardTitle>
                      <CardDescription>
                        {posts.length} posts found. Click column headers to sort.
                      </CardDescription>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleRefresh}
                          disabled={isLoading || refreshCountdown > 0}
                        >
                          {refreshCountdown > 0 ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {refreshCountdown > 0
                          ? `Refresh available in ${formatCountdown(refreshCountdown)}`
                          : 'Refresh data'}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <ThreadsDataTable data={posts} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </>
    </TooltipProvider>
  );
}