'use client'

import { useState, useEffect } from 'react'
import { UserProfile, GeneratedStrategy } from '@/lib/strategy-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PostTemplates } from './post-templates'
import {
  Target, Users, Lightbulb, Calendar, Rocket,
  CheckCircle2, Trophy, AlertCircle, Loader2,
  Sparkles, Heart
} from 'lucide-react'

interface NewStrategyDashboardProps {
  profile: UserProfile
}

export function NewStrategyDashboard({ profile }: NewStrategyDashboardProps) {
  const [strategy, setStrategy] = useState<GeneratedStrategy | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateStrategy()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const generateStrategy = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate strategy')
      }

      // Check if we got a warning (fallback strategy)
      if (data.warning) {
        console.warn('Using fallback strategy:', data.warning)
      }

      setStrategy(data.strategy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="link"
            className="ml-2"
            onClick={generateStrategy}
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!strategy || !strategy.aboutMe) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No strategy available. Please complete all steps first.
          <Button
            variant="link"
            className="ml-2"
            onClick={generateStrategy}
          >
            Generate Strategy
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Your Personalized Strategy</h2>
        <p className="text-muted-foreground">
          Everything you need to grow with confidence
        </p>
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
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="default">Main</Badge>
                <p className="text-sm">{strategy.aboutMe.mainGoal}</p>
              </div>
              {strategy.aboutMe.secondaryGoal && (
                <div className="flex items-start gap-2">
                  <Badge variant="secondary">Secondary</Badge>
                  <p className="text-sm">{strategy.aboutMe.secondaryGoal}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Mission Statement</h3>
            <p className="italic bg-muted p-3 rounded-lg">
              &quot;{strategy.aboutMe.mission}&quot;
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Core Values</h3>
            <div className="flex flex-wrap gap-2">
              {strategy.aboutMe.values.map((value, index) => (
                <Badge key={index} variant="outline">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Their Pains & Struggles</h3>
              <ul className="space-y-2">
                {strategy.aboutAudience.pains.map((pain, index) => (
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
                {strategy.aboutAudience.desires.map((desire, index) => (
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
              {strategy.aboutAudience.portraits.map((portrait, index) => (
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
          <div className="space-y-3">
            {strategy.personalInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 mt-1 text-yellow-500" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
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
          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="actions">Priority Actions</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Evolution</TabsTrigger>
              <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="mt-4">
              <div className="space-y-3">
                {strategy.postingStrategy.actions
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
                {strategy.postingStrategy.weeklyStrategy.map((week, index) => (
                  <div key={index}>
                    <h4 className="font-semibold mb-2">{week.weeks}</h4>
                    <p className="text-sm text-muted-foreground">{week.focus}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-4">
              <div className="space-y-2">
                {strategy.postingStrategy.weeklySchedule.map((day, index) => (
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
        </CardContent>
      </Card>

      {/* Post Templates Section */}
      <PostTemplates
        templates={strategy.posts.templates}
        pillars={strategy.posts.pillars}
      />

      {/* Tips & Tricks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Tips & Tricks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase text-primary">
              Personalized for You
            </h3>
            <div className="space-y-2">
              {strategy.tipsAndTricks.personalized.map((tip, index) => (
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
              {strategy.tipsAndTricks.general.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
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
          <p className="font-medium">{strategy.personalChallenge.description}</p>

          <div>
            <h4 className="font-semibold mb-2">Steps:</h4>
            <ol className="space-y-1">
              {strategy.personalChallenge.steps.map((step, index) => (
                <li key={index} className="text-sm">
                  {index + 1}. {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm">
              <span className="font-semibold">Expected Results:</span>{' '}
              {strategy.personalChallenge.expectedResults}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-10 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Generating your personalized strategy...</span>
      </div>
    </div>
  )
}