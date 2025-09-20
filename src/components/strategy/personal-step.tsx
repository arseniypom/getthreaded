'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { UserProfile, JourneyStage, WorkStyle, ContentStyle, FocusStyle, CreatorStyle, TimeCommitment } from '@/lib/strategy-types'
import { Card, CardContent } from '@/components/ui/card'
import { Sprout, Rocket, TrendingUp, RefreshCw, Zap, Gem, FileText, Video, Target, Rainbow, Calendar, Flame } from 'lucide-react'
import { useState } from 'react'

interface PersonalStepProps {
  profile: Partial<UserProfile>
  onUpdate: (updates: Partial<UserProfile>) => void
}

export function PersonalStep({ profile, onUpdate }: PersonalStepProps) {
  const [name, setName] = useState(profile.personal?.name || '')
  const [handle, setHandle] = useState(profile.personal?.handle || '')
  const [context, setContext] = useState(profile.personal?.context || '')
  const [journeyStage, setJourneyStage] = useState<JourneyStage | undefined>(profile.personal?.journeyStage)
  const [workStyle, setWorkStyle] = useState<WorkStyle | undefined>(profile.personal?.workPreferences?.style)
  const [contentType, setContentType] = useState<ContentStyle | undefined>(profile.personal?.workPreferences?.contentType)
  const [focus, setFocus] = useState<FocusStyle | undefined>(profile.personal?.workPreferences?.focus)
  const [creatorType, setCreatorType] = useState<CreatorStyle | undefined>(profile.personal?.workPreferences?.creatorType)
  const [timeCommitment, setTimeCommitment] = useState<TimeCommitment>('3-5')

  const handleUpdate = () => {
    onUpdate({
      personal: {
        name,
        handle,
        journeyStage: journeyStage!,
        context,
        workPreferences: {
          style: workStyle!,
          contentType: contentType!,
          focus: focus!,
          creatorType: creatorType!,
          timeCommitment
        }
      }
    })
  }

  const journeyOptions = [
    { value: 'just-starting', icon: Sprout, title: 'Just Starting', desc: "I'm brand new to content creation" },
    { value: 'building', icon: Rocket, title: 'Building Momentum', desc: 'I post sometimes, want consistency' },
    { value: 'scaling', icon: TrendingUp, title: 'Ready to Scale', desc: "I'm consistent, need to level up" },
    { value: 'pivoting', icon: RefreshCw, title: 'Pivoting/Rebranding', desc: 'Time for something new' }
  ]

  const getTimeCommitmentLabel = () => {
    const labels: Record<TimeCommitment, string> = {
      '1-2': 'With 1-2 hrs you can expect 3-5 quality posts per week',
      '3-5': 'With 3-5 hrs you can expect daily posting with engagement',
      '5-10': 'With 5-10 hrs you can build a strong presence across platforms',
      '10+': 'With 10+ hrs you can dominate your niche with premium content'
    }
    return labels[timeCommitment]
  }

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
                    handleUpdate()
                  }}
                  placeholder="How should we address you?"
                />
                <p className="text-sm text-muted-foreground">How should we address you?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="handle">Your Creator Handle</Label>
                <Input
                  id="handle"
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value)
                    handleUpdate()
                  }}
                  placeholder="@username"
                />
                <p className="text-sm text-muted-foreground">Your handle across platforms</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Section 2: Quick Context</h3>

            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Where are you in your journey?</Label>
                <div className="grid grid-cols-2 gap-3">
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
                          setJourneyStage(option.value as JourneyStage)
                          handleUpdate()
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Icon className="h-5 w-5 mt-1" />
                            <div>
                              <p className="font-medium">{option.title}</p>
                              <p className="text-sm text-muted-foreground">{option.desc}</p>
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
                      handleUpdate()
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
            <h3 className="text-lg font-semibold mb-4">Section 3: Quick Win Preferences</h3>

            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">How do you like to work?</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant={workStyle === 'fast-scrappy' ? 'default' : 'outline'}
                      onClick={() => {
                        setWorkStyle('fast-scrappy')
                        handleUpdate()
                      }}
                      className="flex-1"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Fast & scrappy
                    </Button>
                    <Button
                      variant={workStyle === 'polished-perfect' ? 'default' : 'outline'}
                      onClick={() => {
                        setWorkStyle('polished-perfect')
                        handleUpdate()
                      }}
                      className="flex-1"
                    >
                      <Gem className="mr-2 h-4 w-4" />
                      Polished & perfect
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={contentType === 'written' ? 'default' : 'outline'}
                      onClick={() => {
                        setContentType('written')
                        handleUpdate()
                      }}
                      className="flex-1"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Written content
                    </Button>
                    <Button
                      variant={contentType === 'video-first' ? 'default' : 'outline'}
                      onClick={() => {
                        setContentType('video-first')
                        handleUpdate()
                      }}
                      className="flex-1"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Video first
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={focus === 'niche-focused' ? 'default' : 'outline'}
                      onClick={() => {
                        setFocus('niche-focused')
                        handleUpdate()
                      }}
                      className="flex-1"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Niche-focused
                    </Button>
                    <Button
                      variant={focus === 'multi-passionate' ? 'default' : 'outline'}
                      onClick={() => {
                        setFocus('multi-passionate')
                        handleUpdate()
                      }}
                      className="flex-1"
                    >
                      <Rainbow className="mr-2 h-4 w-4" />
                      Multi-passionate
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={creatorType === 'batch' ? 'default' : 'outline'}
                      onClick={() => {
                        setCreatorType('batch')
                        handleUpdate()
                      }}
                      className="flex-1"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Batch creator
                    </Button>
                    <Button
                      variant={creatorType === 'daily' ? 'default' : 'outline'}
                      onClick={() => {
                        setCreatorType('daily')
                        handleUpdate()
                      }}
                      className="flex-1"
                    >
                      <Flame className="mr-2 h-4 w-4" />
                      Daily poster
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Time commitment reality check</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  How many hours per week for content?
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>1-2 hrs</span>
                    <span>3-5 hrs</span>
                    <span>5-10 hrs</span>
                    <span>10+ hrs</span>
                  </div>
                  <Slider
                    value={[timeCommitment === '1-2' ? 0 : timeCommitment === '3-5' ? 33 : timeCommitment === '5-10' ? 66 : 100]}
                    onValueChange={(value) => {
                      const val = value[0]
                      const commitment = val < 25 ? '1-2' : val < 50 ? '3-5' : val < 75 ? '5-10' : '10+'
                      setTimeCommitment(commitment)
                      handleUpdate()
                    }}
                    max={100}
                    step={33}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {getTimeCommitmentLabel()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}