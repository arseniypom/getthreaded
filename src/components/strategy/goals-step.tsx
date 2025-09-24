'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserProfile, Timeframe } from '@/lib/strategy-types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Target } from 'lucide-react'
import { useState } from 'react'

interface GoalsStepProps {
  profile: Partial<UserProfile>
  onUpdate: (updates: Partial<UserProfile>) => void
}

export function GoalsStep({ profile, onUpdate }: GoalsStepProps) {
  const [context, setContext] = useState(profile.personal?.context || '')
  const [primaryGoal, setPrimaryGoal] = useState(profile.personal?.goals?.primary || '')
  const [timeframe, setTimeframe] = useState<Timeframe>(profile.personal?.goals?.timeframe || '3-months')

  const handleUpdate = (overrides?: Partial<{
    context: string;
    primaryGoal: string;
    timeframe: Timeframe;
  }>) => {
    const nextContext = overrides?.context ?? context
    const nextPrimaryGoal = overrides?.primaryGoal ?? primaryGoal
    const nextTimeframe = overrides?.timeframe ?? timeframe

    onUpdate({
      personal: {
        ...profile.personal,
        context: nextContext,
        goals: nextPrimaryGoal ? {
          primary: nextPrimaryGoal,
          timeframe: nextTimeframe
        } : undefined
      }
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Goals</h2>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="context">What brought you here?</Label>
              <p className="text-sm text-muted-foreground">
                Your current situation, problems you&apos;d like to solve, what did you try before? The more details you provide, the better result you&apos;ll get ✨
              </p>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => {
                  setContext(e.target.value)
                  handleUpdate({ context: e.target.value })
                }}
                placeholder="e.g., Want to grow my coaching business, tired of posting without results..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-goal" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Main Goal
                </Label>
                <Input
                  id="primary-goal"
                  value={primaryGoal}
                  onChange={(e) => {
                    setPrimaryGoal(e.target.value)
                    handleUpdate({ primaryGoal: e.target.value })
                  }}
                  placeholder="e.g., Get 10 coaching clients, Launch course, Get 1000 followers"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select
                  value={timeframe}
                  onValueChange={(value: Timeframe) => {
                    setTimeframe(value)
                    handleUpdate({ timeframe: value })
                  }}
                >
                  <SelectTrigger id="timeframe">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-month">1 Month Sprint</SelectItem>
                    <SelectItem value="3-months">3 Month Push</SelectItem>
                    <SelectItem value="6-months">6 Month Journey</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How long do you want to commit to this strategy?
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}