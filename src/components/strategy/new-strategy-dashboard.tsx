'use client'

import { useEffect, useState, useCallback } from 'react'
import { UserProfile, GeneratedStrategy } from '@/lib/strategy-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PostTemplates } from './post-templates'
import { useGenerateFullStrategy } from '@/hooks/use-strategy-generation'
import {
  Target, Users, Lightbulb, Calendar, Rocket,
  CheckCircle2, Trophy, AlertCircle,
  Sparkles, Heart, RefreshCw
} from 'lucide-react'

interface NewStrategyDashboardProps {
  profile: UserProfile
  userId: string
  existingStrategy?: GeneratedStrategy
}

export function NewStrategyDashboard({ profile, userId, existingStrategy }: NewStrategyDashboardProps) {
  const queries = useGenerateFullStrategy(profile)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>(existingStrategy ? 'saved' : 'idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [displayStrategy, setDisplayStrategy] = useState<GeneratedStrategy | null>(existingStrategy || null)

  // Check if any queries are loading (only if we don't have existing strategy)
  const isAnyLoading = !existingStrategy && Object.values(queries).some(q => q.isLoading)

  // Check if all queries have successful data (only relevant if no existing strategy)
  const allQueriesSuccessful = !existingStrategy && Object.values(queries).every(q => q.data && !q.error && !q.isLoading)

  const saveStrategy = useCallback(async () => {
    if (!allQueriesSuccessful) return

    try {
      setSaveState('saving')
      setSaveError(null)

      // Construct the complete generated strategy object
      const generatedStrategy: GeneratedStrategy = {
        aboutMe: queries.aboutMe.data!,
        aboutAudience: queries.aboutAudience.data!,
        personalInsights: queries.insights.data!,
        postingStrategy: queries.postingStrategy.data!,
        posts: queries.posts.data!,
        tipsAndTricks: queries.tips.data!,
        personalChallenge: queries.challenge.data!
      }

      const response = await fetch('/api/save-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userProfile: profile,
          generatedStrategy
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save strategy')
      }

      setSaveState('saved')
      setDisplayStrategy(generatedStrategy)
    } catch (error) {
      console.error('Error saving strategy:', error)
      setSaveState('error')
      setSaveError(error instanceof Error ? error.message : 'Failed to save strategy')
    }
  }, [allQueriesSuccessful, profile, queries, userId])

  // Save strategy to database when all data is loaded (only for new strategies)
  useEffect(() => {
    if (!existingStrategy && allQueriesSuccessful && saveState === 'idle') {
      saveStrategy()
    }
  }, [existingStrategy, allQueriesSuccessful, saveState, saveStrategy])

  // Determine which data to display
  const getDisplayData = () => {
    if (existingStrategy) {
      return existingStrategy
    }

    if (displayStrategy) {
      return displayStrategy
    }

    // Build from queries if all successful
    if (allQueriesSuccessful) {
      return {
        aboutMe: queries.aboutMe.data!,
        aboutAudience: queries.aboutAudience.data!,
        personalInsights: queries.insights.data!,
        postingStrategy: queries.postingStrategy.data!,
        posts: queries.posts.data!,
        tipsAndTricks: queries.tips.data!,
        personalChallenge: queries.challenge.data!
      }
    }

    return null
  }

  const strategyData = getDisplayData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Your Personalized Strategy</h2>
        <p className="text-muted-foreground mb-3">
          {isAnyLoading
            ? "Loading your personalized strategy..."
            : "Everything you need to grow with confidence"}
        </p>

        {/* Save Status Indicator */}
        {saveState !== 'idle' && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4">
            {saveState === 'saving' && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving your strategy...
              </div>
            )}
            {saveState === 'saved' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle2 className="h-4 w-4" />
                Strategy saved successfully
              </div>
            )}
            {saveState === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
                <AlertCircle className="h-4 w-4" />
                {saveError || 'Failed to save strategy'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* About Me Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            About Me
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {existingStrategy ? (
            // Display existing strategy data
            <>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goals
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="default">Main</Badge>
                    <p className="text-sm">{strategyData?.aboutMe.mainGoal}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Mission Statement</h3>
                <p className="italic bg-muted p-3 rounded-lg">
                  &quot;{strategyData?.aboutMe.mission}&quot;
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Core Values</h3>
                <div className="flex flex-wrap gap-2">
                  {strategyData?.aboutMe.values.map((value, index) => (
                    <Badge key={index} variant="outline">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : queries.aboutMe.isLoading ? (
            <AboutMeSkeleton />
          ) : queries.aboutMe.error ? (
            <ErrorAlert
              message={queries.aboutMe.error.message}
              onRetry={() => queries.aboutMe.refetch()}
            />
          ) : queries.aboutMe.data ? (
            <>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goals
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="default">Main</Badge>
                    <p className="text-sm">{queries.aboutMe.data.mainGoal}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Mission Statement</h3>
                <p className="italic bg-muted p-3 rounded-lg">
                  &quot;{queries.aboutMe.data.mission}&quot;
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Core Values</h3>
                <div className="flex flex-wrap gap-2">
                  {queries.aboutMe.data.values.map((value, index) => (
                    <Badge key={index} variant="outline">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* About My Audience Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            About My Audience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {queries.aboutAudience.isLoading ? (
            <AudienceSkeleton />
          ) : queries.aboutAudience.error ? (
            <ErrorAlert
              message={queries.aboutAudience.error.message}
              onRetry={() => queries.aboutAudience.refetch()}
            />
          ) : queries.aboutAudience.data ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Their Pains & Struggles</h3>
                  <ul className="space-y-2">
                    {queries.aboutAudience.data.pains.map((pain, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 mt-0.5">•</span>
                        {pain}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Their Deep Desires</h3>
                  <ul className="space-y-2">
                    {queries.aboutAudience.data.desires.map((desire, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">•</span>
                        {desire}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Audience Portraits</h3>
                <div className="space-y-3">
                  {queries.aboutAudience.data.portraits.map((portrait, index) => (
                    <Card key={index} className="bg-secondary/30">
                      <CardContent className="pt-4">
                        <p className="font-medium mb-1">{portrait.name}</p>
                        <p className="text-sm text-muted-foreground italic">
                          {portrait.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Personal Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Personal Insights
          </CardTitle>
          <CardDescription>
            Unique observations about your positioning
          </CardDescription>
        </CardHeader>
        <CardContent>
          {queries.insights.isLoading ? (
            <InsightsSkeleton />
          ) : queries.insights.error ? (
            <ErrorAlert
              message={queries.insights.error.message}
              onRetry={() => queries.insights.refetch()}
            />
          ) : queries.insights.data ? (
            <div className="space-y-3">
              {queries.insights.data.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Sparkles className="h-4 w-4 mt-1 text-yellow-500" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Posting Strategy Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Posting Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queries.postingStrategy.isLoading ? (
            <PostingStrategySkeleton />
          ) : queries.postingStrategy.error ? (
            <ErrorAlert
              message={queries.postingStrategy.error.message}
              onRetry={() => queries.postingStrategy.refetch()}
            />
          ) : queries.postingStrategy.data ? (
            <Tabs defaultValue="actions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="actions">Priority Actions</TabsTrigger>
                <TabsTrigger value="weekly">Weekly Evolution</TabsTrigger>
                <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="actions" className="mt-4">
                <div className="space-y-3">
                  {queries.postingStrategy.data.actions
                    .sort((a, b) => a.priority - b.priority)
                    .map((action) => (
                      <div key={action.priority} className="flex items-start gap-3">
                        <Badge variant="outline" className="min-w-[24px]">
                          {action.priority}
                        </Badge>
                        <p className="text-sm">{action.action}</p>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="weekly" className="mt-4">
                <div className="space-y-4">
                  {queries.postingStrategy.data.weeklyStrategy.map((week, index) => (
                    <div key={index}>
                      <h4 className="font-semibold mb-2">{week.weeks}</h4>
                      <p className="text-sm text-muted-foreground">{week.focus}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="mt-4">
                <div className="space-y-2">
                  {queries.postingStrategy.data.weeklySchedule.map((day, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{day.day}</span>
                        <Badge variant="secondary">{day.postType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pillar: {day.pillar}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </CardContent>
      </Card>

      {/* Post Templates Section */}
      {queries.posts.isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Post Templates & Examples</CardTitle>
            <CardDescription>Loading templates...</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ) : queries.posts.error ? (
        <Card>
          <CardHeader>
            <CardTitle>Post Templates & Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorAlert
              message={queries.posts.error.message}
              onRetry={() => queries.posts.refetch()}
            />
          </CardContent>
        </Card>
      ) : queries.posts.data ? (
        <PostTemplates
          templates={queries.posts.data.templates}
          pillars={queries.posts.data.pillars}
        />
      ) : null}

      {/* Tips & Tricks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Tips & Tricks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {queries.tips.isLoading ? (
            <TipsSkeleton />
          ) : queries.tips.error ? (
            <ErrorAlert
              message={queries.tips.error.message}
              onRetry={() => queries.tips.refetch()}
            />
          ) : queries.tips.data ? (
            <>
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase text-primary">
                  Personalized for You
                </h3>
                <div className="space-y-2">
                  {queries.tips.data.personalized.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">
                  Universal Tips
                </h3>
                <div className="space-y-2">
                  {queries.tips.data.general.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Personal Challenge Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Personal Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {queries.challenge.isLoading ? (
            <ChallengeSkeleton />
          ) : queries.challenge.error ? (
            <ErrorAlert
              message={queries.challenge.error.message}
              onRetry={() => queries.challenge.refetch()}
            />
          ) : queries.challenge.data ? (
            <>
              <p className="font-medium">{queries.challenge.data.description}</p>

              <div>
                <h4 className="font-semibold mb-2">Steps:</h4>
                <ol className="space-y-1">
                  {queries.challenge.data.steps.map((step, index) => (
                    <li key={index} className="text-sm">
                      {index + 1}. {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm">
                  <span className="font-semibold">Expected Results:</span>{' '}
                  {queries.challenge.data.expectedResults}
                </p>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

// Component Skeletons
function AboutMeSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-12 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

function AudienceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

function PostingStrategySkeleton() {
  return <Skeleton className="h-64 w-full" />
}

function TipsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

function ChallengeSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

function ErrorAlert({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="ml-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}