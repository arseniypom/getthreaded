'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { UserProfile, JourneyStage } from '@/lib/strategy-types'
import { Card, CardContent } from '@/components/ui/card'
import { Sprout, Rocket, TrendingUp, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface PersonalStepProps {
  profile: Partial<UserProfile>
  onUpdate: (updates: Partial<UserProfile>) => void
}

export function PersonalStep({ profile, onUpdate }: PersonalStepProps) {
  const [name, setName] = useState(profile.personal?.name || '')
  const [handle, setHandle] = useState(profile.personal?.handle || '')
  const [noHandleYet, setNoHandleYet] = useState(profile.personal?.handle === 'pending' || false)
  const [journeyStage, setJourneyStage] = useState<JourneyStage | undefined>(profile.personal?.journeyStage)

  const handleUpdate = (overrides?: Partial<{
    name: string;
    handle: string;
    noHandleYet: boolean;
    journeyStage: JourneyStage | undefined;
  }>) => {
    const nextName = overrides?.name ?? name
    const nextHandle = overrides?.handle ?? handle
    const nextNoHandleYet = overrides?.noHandleYet ?? noHandleYet
    const nextJourneyStage = overrides?.journeyStage ?? journeyStage

    onUpdate({
      personal: {
        ...profile.personal,
        name: nextName,
        handle: nextNoHandleYet ? 'pending' : nextHandle,
        journeyStage: nextJourneyStage!
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
        <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Section 1: Identity</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <h3 className="text-lg font-semibold mb-4">Section 2: Journey Stage</h3>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}