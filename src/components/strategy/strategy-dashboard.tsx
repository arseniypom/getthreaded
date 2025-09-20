'use client'

import { UserProfile } from '@/lib/strategy-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar, Target, TrendingUp, Lightbulb, Rocket,
  CheckCircle2, BarChart, Trophy, AlertCircle
} from 'lucide-react'

interface StrategyDashboardProps {
  profile: UserProfile
}

export function StrategyDashboard({ profile }: StrategyDashboardProps) {
  const getMissionStatement = () => {
    const audienceDesc = getAudienceDescription()
    const painPointsText = profile.audience?.psychographics?.painPoints
      ?.slice(0, 3)
      .map(p => p.replace('-', ' '))
      .join(', ')
    const aspirationsText = profile.audience?.psychographics?.aspirations
      ?.slice(0, 2)
      .map(a => a.replace('-', ' '))
      .join(' and ')
    const pillarsText = profile.pillars?.slice(0, 2).join(' and ')
    const voiceStyle = getVoiceStyle()

    return `I help ${audienceDesc} who struggle with ${painPointsText} achieve ${aspirationsText} through ${pillarsText} delivered in a ${voiceStyle} way.`
  }

  const getAudienceDescription = () => {
    const age = profile.audience?.demographics?.ageRange
    const reality = profile.audience?.psychographics?.dailyReality?.[0]?.replace('-', ' ')
    return `${reality || 'professionals'} aged ${age?.min}-${age?.max}`
  }

  const getVoiceStyle = () => {
    const matrix = profile.voice?.matrix
    if (!matrix) return 'balanced'

    const casual = matrix.casual || 0
    const bold = matrix.bold || 0

    if (casual > 50 && bold > 50) return 'casual and bold'
    if (casual > 50 && bold <= 50) return 'casual and thoughtful'
    if (casual <= 50 && bold > 50) return 'professional and bold'
    return 'professional and thoughtful'
  }

  const getWeeklyCalendar = () => {
    const pillars = profile.pillars || []
    const noWeekends = profile.boundaries?.operationalConstraints?.noWeekends
    const preferQA = profile.boundaries?.operationalConstraints?.preferQA

    const calendar = [
      {
        day: 'Monday',
        type: 'Motivational Start',
        pillar: pillars[0] || 'Core Topic',
        format: 'Hook + 3 points + CTA',
        style: 'Expose'
      },
      {
        day: 'Tuesday',
        type: 'Teaching Tuesday',
        pillar: pillars[1] || 'Secondary Topic',
        format: 'Problem → Solution → Implementation',
        style: 'Educate'
      },
      {
        day: 'Wednesday',
        type: 'Engagement Day',
        pillar: preferQA ? 'Q&A Focus' : 'Mixed',
        format: preferQA ? 'Open question format' : 'Discussion starter',
        style: 'Engage'
      },
      {
        day: 'Thursday',
        type: 'Tactical Thursday',
        pillar: pillars[2] || pillars[0] || 'Core Topic',
        format: 'Step-by-step guide',
        style: 'Educate'
      },
      {
        day: 'Friday',
        type: 'Reflection & Recap',
        pillar: 'Mixed',
        format: 'Week lessons + weekend challenge',
        style: 'Expose'
      }
    ]

    if (!noWeekends) {
      calendar.push(
        {
          day: 'Saturday',
          type: 'Weekend Wisdom',
          pillar: 'Light Topic',
          format: 'Story or insight',
          style: 'Engage'
        },
        {
          day: 'Sunday',
          type: 'Sunday Setup',
          pillar: 'Planning',
          format: 'Week ahead preview',
          style: 'Educate'
        }
      )
    }

    return calendar
  }

  const getFirstWeekPosts = () => {
    const hooks = profile.voice?.signatureMoves?.includes('hook-master')
      ? 'question-based'
      : profile.voice?.signatureMoves?.includes('myth-buster')
      ? 'myth-busting'
      : 'direct statement'

    const posts = []

    posts.push(`**Monday Post (${hooks} hook):**
&quot;The biggest lie about ${profile.niches?.primary?.toLowerCase()}?

That you need [common misconception].

Truth: [Contrarian insight]

Here's what actually works:
1. [Specific tip]
2. [Specific tip]
3. [Specific tip]

What myth held you back the longest?&quot;`)

    posts.push(`**Tuesday Post (Teaching):**
&quot;How to [solve specific problem] in 5 minutes:

Step 1: [Action]
Step 2: [Action]
Step 3: [Action]

I used this yesterday and [specific result].

Save this for when you need it.&quot;`)

    if (profile.boundaries?.operationalConstraints?.preferQA) {
      posts.push(`**Wednesday Post (Q&A):**
&quot;What&apos;s your biggest challenge with [topic]?

Drop it below and I&apos;ll share what&apos;s worked for me.

(No judgment zone - we&apos;re all figuring this out together)&quot;`)
    }

    return posts
  }

  const getGrowthFormula = () => {
    const formula = {
      week1_2: [
        `Post at optimal times based on your audience data`,
        `Use your ${profile.voice?.signatureMoves?.[0]?.replace('-', ' ')} style in 80% of posts`,
        `Focus on ${profile.pillars?.[0]} to establish expertise`
      ],
      week3_4: [
        `Add ${profile.voice?.signatureMoves?.[1]?.replace('-', ' ')} approach`,
        `Introduce ${profile.pillars?.[1]}`,
        `Start tracking: Which posts get most saves and comments`
      ],
      week5_8: [
        `Double down on what works`,
        `Test ${profile.voice?.nonNegotiables?.controversyComfort} controversy level`,
        `Build your "greatest hits" collection`
      ]
    }

    return formula
  }

  const getQuickWinTactics = () => {
    const tactics = []

    // Default tactics based on journey stage
    if (profile.personal?.journeyStage === 'just-starting') {
      tactics.push('Batch create on Sunday: Write 5 posts in one sitting')
      tactics.push('Use 60% evergreen, 40% timely content ratio')
    }

    if (profile.personal?.journeyStage === 'building') {
      tactics.push('Create templates, fill in specific details')
      tactics.push('Sunday prep, schedule entire week')
    }

    if (profile.personal?.journeyStage === 'scaling') {
      tactics.push('Voice notes → transcribe → quick edit workflow')
      tactics.push('Morning coffee = content creation time')
    }

    tactics.push('Repurpose winners after 30 days')

    return tactics
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Your Personalized Content Playbook</h2>
        <p className="text-muted-foreground">
          Everything you need to start creating with confidence
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Quick Strategy Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span>{profile.personal?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Stage:</span>
              <Badge variant="outline">{profile.personal?.journeyStage?.replace('-', ' ')}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Voice:</span>
              <span>{getVoiceStyle()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Timeframe:</span>
              <span>{profile.personal?.goals?.timeframe?.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Primary Focus:</span>
              <span>{profile.niches?.primary}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Content Mission Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed italic">
            &quot;{getMissionStatement()}&quot;
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Weekly Calendar</TabsTrigger>
          <TabsTrigger value="examples">First Week Posts</TabsTrigger>
          <TabsTrigger value="growth">Growth Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Your 7-Day Content Calendar
              </CardTitle>
              <CardDescription>
                Repeatable weekly schedule based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getWeeklyCalendar().map((day) => (
                  <div key={day.day} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{day.day} - {day.type}</h4>
                      <Badge variant="secondary">{day.style}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Pillar: {day.pillar}</p>
                      <p>Format: {day.format}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Your First Week&apos;s Posts
              </CardTitle>
              <CardDescription>
                Tailored examples based on your niche and voice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-6">
                  {getFirstWeekPosts().map((post, index) => (
                    <div key={index} className="space-y-2">
                      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                        {post}
                      </pre>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Growth Formula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(getGrowthFormula()).map(([period, actions]) => (
                <div key={period} className="space-y-2">
                  <h4 className="font-semibold">
                    {period === 'week1_2' ? 'Week 1-2: Foundation' :
                     period === 'week3_4' ? 'Week 3-4: Expansion' :
                     'Week 5-8: Optimization'}
                  </h4>
                  <ul className="space-y-1">
                    {actions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Quick Win Tactics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getQuickWinTactics().map((tactic, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>{tactic}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Your Personal Guardrails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">Remember, you said no to:</p>
              <ul className="space-y-1">
                {profile.boundaries?.operationalConstraints?.noDMs && (
                  <li className="text-sm text-muted-foreground">• No DMs → Use &quot;Comment [word] below&quot;</li>
                )}
                {profile.boundaries?.operationalConstraints?.noSwearing && (
                  <li className="text-sm text-muted-foreground">• No swearing → Keep it clean</li>
                )}
                {profile.boundaries?.operationalConstraints?.noWeekends && (
                  <li className="text-sm text-muted-foreground">• No weekends → Mon-Fri only</li>
                )}
                {profile.boundaries?.contentBoundaries?.noPoliticsReligion && (
                  <li className="text-sm text-muted-foreground">• No politics/religion</li>
                )}
                {profile.boundaries?.contentBoundaries?.textOnly && (
                  <li className="text-sm text-muted-foreground">• Text only content</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your 30-Day Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">The Challenge:</p>
              <ol className="space-y-1 text-sm">
                <li>1. Post once daily using the calendar</li>
                <li>2. Respond to every comment for 48 hours</li>
                <li>3. Save your top 10 performers</li>
                <li>4. After 30 days: Double down on what worked</li>
              </ol>
            </div>

            <div>
              <p className="font-medium mb-2">Expected Results for &quot;{profile.personal?.journeyStage}&quot;:</p>
              <p className="text-sm text-muted-foreground">
                {profile.personal?.journeyStage === 'just-starting' &&
                  'Find your voice, gain first 100 engaged followers'}
                {profile.personal?.journeyStage === 'building' &&
                  '2-3x engagement, clear content identity'}
                {profile.personal?.journeyStage === 'scaling' &&
                  'Systematic growth, partnership opportunities'}
                {profile.personal?.journeyStage === 'pivoting' &&
                  'New audience clarity within 2 weeks'}
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm italic text-center">
                Remember: You&apos;re on a {profile.personal?.goals?.timeframe?.replace('-', ' ')} journey.
                Focus on consistency over perfection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}