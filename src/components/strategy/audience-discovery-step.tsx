'use client'

import { UserProfile, GenderMix, DailyReality } from '@/lib/strategy-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useState } from 'react'
import {
  Target, Users, GraduationCap, Briefcase, Heart, Gamepad2, Building,
  Palette
} from 'lucide-react'

interface AudienceDiscoveryStepProps {
  profile: Partial<UserProfile>
  onUpdate: (updates: Partial<UserProfile>) => void
}

export function AudienceDiscoveryStep({ profile, onUpdate }: AudienceDiscoveryStepProps) {
  const [ageRange, setAgeRange] = useState<[number, number]>([
    profile.audience?.demographics?.ageRange?.min || 25,
    profile.audience?.demographics?.ageRange?.max || 40
  ])
  const [genderMix, setGenderMix] = useState<GenderMix>(
    profile.audience?.demographics?.genderMix || 'mixed'
  )
  const [location, setLocation] = useState(
    profile.audience?.demographics?.location || ''
  )
  const [dailyRealities, setDailyRealities] = useState<DailyReality[]>(
    profile.audience?.psychographics?.dailyReality || []
  )

  const updateProfile = () => {
    onUpdate({
      audience: {
        demographics: {
          ageRange: { min: ageRange[0], max: ageRange[1] },
          genderMix,
          location
        },
        psychographics: {
          dailyReality: dailyRealities
        }
      }
    })
  }

  const dailyRealityOptions = [
    { id: 'career-focused' as DailyReality, icon: Target, label: 'Career-focused achiever' },
    { id: 'family-first' as DailyReality, icon: Users, label: 'Family-first parent' },
    { id: 'lifelong-learner' as DailyReality, icon: GraduationCap, label: 'Lifelong learner' },
    { id: 'side-hustle' as DailyReality, icon: Briefcase, label: 'Side-hustle juggler' },
    { id: 'wellness-warrior' as DailyReality, icon: Heart, label: 'Wellness warrior' },
    { id: 'digital-native' as DailyReality, icon: Gamepad2, label: 'Digital native' },
    { id: 'corporate-climber' as DailyReality, icon: Building, label: 'Corporate climber' },
    { id: 'creative-soul' as DailyReality, icon: Palette, label: 'Creative soul' }
  ]



  const toggleArrayItem = <T extends string>(
    array: T[],
    setArray: (arr: T[]) => void,
    item: T,
    max: number
  ) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item))
    } else if (array.length < max) {
      setArray([...array, item])
    }
    updateProfile()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Who Are You Talking To?</h2>
        <p className="text-muted-foreground">
          Understanding your audience unlocks everything
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section 1: Audience Demographics</CardTitle>
          <CardDescription>The Basics - Who They Are</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Age Range</Label>
            <div className="px-4">
              <div className="flex justify-between text-sm mb-2">
                <span>{ageRange[0]}</span>
                <span className="text-muted-foreground">
                  {ageRange[0] < 25 ? 'Gen Z' : ageRange[0] < 41 ? 'Millennials' : ageRange[0] < 57 ? 'Gen X' : 'Boomers'}
                  {' - '}
                  {ageRange[1] < 25 ? 'Gen Z' : ageRange[1] < 41 ? 'Millennials' : ageRange[1] < 57 ? 'Gen X' : 'Boomers'}
                </span>
                <span>{ageRange[1]}</span>
              </div>
              <Slider
                value={ageRange}
                onValueChange={(value) => {
                  setAgeRange(value as [number, number])
                  updateProfile()
                }}
                min={18}
                max={65}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gender Mix</Label>
            <RadioGroup value={genderMix} onValueChange={(value) => {
              setGenderMix(value as GenderMix)
              updateProfile()
            }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="primarily-male" id="gender-male" />
                <Label htmlFor="gender-male">Primarily Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="gender-mixed" />
                <Label htmlFor="gender-mixed">Mixed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="primarily-female" id="gender-female" />
                <Label htmlFor="gender-female">Primarily Female</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value)
                updateProfile()
              }}
              placeholder="e.g., Urban US, Global, Europe"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section 2: Daily Reality</CardTitle>
          <CardDescription>What Your Audience&apos;s Day-to-Day Looks Like</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">Their Daily Reality (select up to 5)</Label>
            <div className="grid grid-cols-2 gap-2">
              {dailyRealityOptions.map(option => {
                const Icon = option.icon
                const isSelected = dailyRealities.includes(option.id)
                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleArrayItem(dailyRealities, setDailyRealities, option.id, 5)}
                    className="justify-start"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}