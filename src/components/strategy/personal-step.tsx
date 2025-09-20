'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { UserProfile, JourneyStage, Timeframe } from '@/lib/strategy-types'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sprout, Rocket, TrendingUp, RefreshCw, Target, Flag } from 'lucide-react'
import { useState } from 'react'

interface PersonalStepProps {
  profile: Partial<UserProfile>
  onUpdate: (updates: Partial<UserProfile>) => void
}

export function PersonalStep({ profile, onUpdate }: PersonalStepProps) {
  const [name, setName] = useState(profile.personal?.name || '')
  const [handle, setHandle] = useState(profile.personal?.handle || '')
  const [noHandleYet, setNoHandleYet] = useState(profile.personal?.handle === 'pending' || false)
  const [context, setContext] = useState(profile.personal?.context || '')
  const [journeyStage, setJourneyStage] = useState<JourneyStage | undefined>(profile.personal?.journeyStage)
  const [primaryGoal, setPrimaryGoal] = useState(profile.personal?.goals?.primary || '')
  const [secondaryGoal, setSecondaryGoal] = useState(profile.personal?.goals?.secondary || '')
  const [timeframe, setTimeframe] = useState<Timeframe>(profile.personal?.goals?.timeframe || '3-months')

  const handleUpdate = (overrides?: Partial<{
    name: string;
    handle: string;
    noHandleYet: boolean;
    journeyStage: JourneyStage | undefined;
    context: string;
    primaryGoal: string;
    secondaryGoal: string;
    timeframe: Timeframe;
  }>) => {
    const nextName = overrides?.name ?? name
    const nextHandle = overrides?.handle ?? handle
    const nextNoHandleYet = overrides?.noHandleYet ?? noHandleYet
    const nextJourneyStage = overrides?.journeyStage ?? journeyStage
    const nextContext = overrides?.context ?? context
    const nextPrimaryGoal = overrides?.primaryGoal ?? primaryGoal
    const nextSecondaryGoal = overrides?.secondaryGoal ?? secondaryGoal
    const nextTimeframe = overrides?.timeframe ?? timeframe

    onUpdate({
      personal: {
        name: nextName,
        handle: nextNoHandleYet ? 'pending' : nextHandle,
        journeyStage: nextJourneyStage!,
        context: nextContext,
        goals: nextPrimaryGoal ? {
          primary: nextPrimaryGoal,
          secondary: nextSecondaryGoal || undefined,
          timeframe: nextTimeframe
        } : undefined
      }
    })
  }

  const journeyOptions = [
    { value: 'just-starting', icon: Sprout, title: 'Just Starting', desc: "I'm brand new to content creation" },
    { value: 'building', icon: Rocket, title: 'Building Momentum', desc: 'I post sometimes, want consistency' },
    { value: 'scaling', icon: TrendingUp, title: 'Ready to Scale', desc: "I'm consistent, need to level up" },
    { value: 'pivoting', icon: RefreshCw, title: 'Pivoting / Rebranding', desc: 'Time for something new' }
  ]


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Personal</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Section 1: Identity</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    handleUpdate({ name: e.target.value })
                  }}
                  placeholder="How should we address you?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handle">Your Creator Handle</Label>
                <Input
                  id="handle"
                  value={noHandleYet ? '' : handle}
                  onChange={(e) => {
                    setHandle(e.target.value)
                    handleUpdate({ handle: e.target.value })
                  }}
                  placeholder="@username"
                  disabled={noHandleYet}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="no-handle"
                    checked={noHandleYet}
                    onCheckedChange={(checked) => {
                      const isChecked = checked as boolean
                      setNoHandleYet(isChecked)
                      if (isChecked) {
                        setHandle('')
                      }
                      handleUpdate({ noHandleYet: isChecked, handle: isChecked ? '' : handle })
                    }}
                  />
                  <Label htmlFor="no-handle" className="text-sm font-normal cursor-pointer">
                    I don&apos;t have it yet
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Section 2: Quick Context</h3>

            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Where are you in your journey?</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {journeyOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all ${
                          journeyStage === option.value
                            ? 'ring-2 ring-primary'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => {
                          const stage = option.value as JourneyStage
                          setJourneyStage(stage)
                          handleUpdate({ journeyStage: stage })
                        }}
                      >
                        <CardContent className="px-3">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <p className="font-medium text-sm">{option.title}</p>
                              <p className="text-xs text-muted-foreground">{option.desc}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">What brought you here? (Optional)</Label>
                <Textarea
                  id="context"
                  value={context}
                  onChange={(e) => {
                    if (e.target.value.length <= 280) {
                      setContext(e.target.value)
                      handleUpdate({ context: e.target.value })
                    }
                  }}
                  placeholder="e.g., Want to grow my coaching business, tired of posting without results..."
                  className="min-h-[80px]"
                />
                <p className="text-sm text-muted-foreground text-right">
                  {context.length}/280 characters
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Section 3: Your Goals</h3>

            <div className="space-y-4">
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
                  placeholder="e.g., Get 10 coaching clients, Build authority, Launch course"
                />
                <p className="text-sm text-muted-foreground">
                  What&apos;s your primary objective for your social media presence?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-goal" className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Secondary Goal (Optional)
                </Label>
                <Input
                  id="secondary-goal"
                  value={secondaryGoal}
                  onChange={(e) => {
                    setSecondaryGoal(e.target.value)
                    handleUpdate({ secondaryGoal: e.target.value })
                  }}
                  placeholder="e.g., Build email list, Network with peers"
                />
                <p className="text-sm text-muted-foreground">
                  A supporting goal that complements your main objective
                </p>
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