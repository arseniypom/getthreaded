'use client'

import { UserProfile, GenderMix, DailyReality, PainPoint, Aspiration, ScrollTime, Platform, ConsumptionStyle } from '@/lib/strategy-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useState } from 'react'
import {
  Target, Users, GraduationCap, Briefcase, Heart, Gamepad2, Building,
  Palette, Clock, Coffee, Sun, Moon, Sunset,
  Linkedin, Instagram, Twitter, Youtube, Mail,
  Eye, Book, Video, MessageSquare
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
  const [painPoints, setPainPoints] = useState<PainPoint[]>(
    profile.audience?.psychographics?.painPoints || []
  )
  const [aspirations, setAspirations] = useState<Aspiration[]>(
    profile.audience?.psychographics?.aspirations || []
  )
  const [scrollTimes, setScrollTimes] = useState<ScrollTime[]>(
    profile.audience?.behavior?.scrollTimes || []
  )
  const [platforms, setPlatforms] = useState<Platform[]>(
    profile.audience?.behavior?.platforms || []
  )
  const [consumptionStyle, setConsumptionStyle] = useState<ConsumptionStyle>(
    profile.audience?.behavior?.consumptionStyle || 'speed-scanner'
  )
  const [validations, setValidations] = useState({
    noBuy: '',
    keepingUp: '',
    wouldPay: ''
  })

  const updateProfile = () => {
    onUpdate({
      audience: {
        demographics: {
          ageRange: { min: ageRange[0], max: ageRange[1] },
          genderMix,
          location
        },
        psychographics: {
          dailyReality: dailyRealities,
          painPoints,
          aspirations
        },
        behavior: {
          scrollTimes,
          platforms,
          consumptionStyle
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

  const painPointOptions = [
    { id: 'no-time' as PainPoint, label: 'Not enough time in the day' },
    { id: 'career-stuck' as PainPoint, label: 'Feeling stuck in their career' },
    { id: 'info-overload' as PainPoint, label: 'Information overload' },
    { id: 'imposter-syndrome' as PainPoint, label: 'Imposter syndrome' },
    { id: 'work-life-balance' as PainPoint, label: 'Work-life balance struggle' },
    { id: 'financial-stress' as PainPoint, label: 'Financial stress' },
    { id: 'no-direction' as PainPoint, label: 'Lack of clear direction' },
    { id: 'disconnected' as PainPoint, label: 'Feeling disconnected' }
  ]

  const aspirationOptions = [
    { id: 'freedom' as Aspiration, label: 'Freedom & flexibility' },
    { id: 'recognition' as Aspiration, label: 'Recognition & status' },
    { id: 'security' as Aspiration, label: 'Security & stability' },
    { id: 'growth' as Aspiration, label: 'Growth & learning' },
    { id: 'connection' as Aspiration, label: 'Connection & community' },
    { id: 'impact' as Aspiration, label: 'Impact & meaning' }
  ]

  const scrollTimeOptions = [
    { id: 'early-bird' as ScrollTime, icon: Sun, label: 'Early bird (5-8am)' },
    { id: 'commute' as ScrollTime, icon: Coffee, label: 'Commute time (8-9am)' },
    { id: 'lunch' as ScrollTime, icon: Clock, label: 'Lunch break (12-1pm)' },
    { id: 'afternoon-slump' as ScrollTime, icon: Sunset, label: 'Afternoon slump (3-4pm)' },
    { id: 'evening' as ScrollTime, icon: Moon, label: 'Evening wind-down (8-11pm)' },
    { id: 'night-owl' as ScrollTime, icon: Moon, label: 'Night owl (11pm+)' }
  ]

  const platformOptions = [
    { id: 'linkedin' as Platform, icon: Linkedin, label: 'LinkedIn: Professional networking' },
    { id: 'instagram' as Platform, icon: Instagram, label: 'Instagram: Visual inspiration' },
    { id: 'twitter' as Platform, icon: Twitter, label: 'X/Twitter: Real-time thoughts' },
    { id: 'tiktok' as Platform, icon: Video, label: 'TikTok: Entertainment' },
    { id: 'youtube' as Platform, icon: Youtube, label: 'YouTube: Deep learning' },
    { id: 'newsletter' as Platform, icon: Mail, label: 'Newsletter: Curated content' }
  ]

  const consumptionOptions = [
    { id: 'speed-scanner' as ConsumptionStyle, icon: Eye, label: 'Speed Scanner', desc: 'Needs hooks, bullets, summaries' },
    { id: 'deep-diver' as ConsumptionStyle, icon: Book, label: 'Deep Diver', desc: 'Loves long-form, detailed content' },
    { id: 'visual-learner' as ConsumptionStyle, icon: Video, label: 'Visual Learner', desc: 'Prefers video, graphics, demos' },
    { id: 'community-seeker' as ConsumptionStyle, icon: MessageSquare, label: 'Community Seeker', desc: 'Wants discussion, interaction' }
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
          <CardTitle>Section 2: Psychographic Mapping</CardTitle>
          <CardDescription>The Deep Stuff - What Drives Them</CardDescription>
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

          <div>
            <Label className="mb-3 block">Pain Points (select top 3)</Label>
            <div className="space-y-2">
              {painPointOptions.map(option => {
                const isSelected = painPoints.includes(option.id)
                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleArrayItem(painPoints, setPainPoints, option.id, 3)}
                    className="w-full justify-start"
                  >
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">What They&apos;re Chasing</Label>
            <div className="grid grid-cols-2 gap-2">
              {aspirationOptions.map(option => {
                const isSelected = aspirations.includes(option.id)
                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleArrayItem(aspirations, setAspirations, option.id, 6)}
                  >
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section 3: Behavioral Insights</CardTitle>
          <CardDescription>Where & How They Show Up</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">When are they scrolling?</Label>
            <div className="grid grid-cols-2 gap-2">
              {scrollTimeOptions.map(option => {
                const Icon = option.icon
                const isSelected = scrollTimes.includes(option.id)
                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleArrayItem(scrollTimes, setScrollTimes, option.id, 6)}
                    className="justify-start"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Platform Behavior (rank by importance)</Label>
            <div className="space-y-2">
              {platformOptions.map(option => {
                const Icon = option.icon
                const isSelected = platforms.includes(option.id)
                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleArrayItem(platforms, setPlatforms, option.id, 6)}
                    className="w-full justify-start"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Content Consumption Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {consumptionOptions.map(option => {
                const Icon = option.icon
                return (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      consumptionStyle === option.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setConsumptionStyle(option.id)
                      updateProfile()
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        <Icon className="h-5 w-5 mt-1" />
                        <div>
                          <p className="font-medium text-sm">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Check - Do You Really Know Them?</CardTitle>
          <CardDescription>Fill in the blanks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="no-buy">My audience would never buy from someone who ______</Label>
            <Input
              id="no-buy"
              value={validations.noBuy}
              onChange={(e) => setValidations({ ...validations, noBuy: e.target.value })}
              placeholder="e.g., uses too much jargon, seems fake..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keeping-up">The #1 thing keeping them up at night is ______</Label>
            <Input
              id="keeping-up"
              value={validations.keepingUp}
              onChange={(e) => setValidations({ ...validations, keepingUp: e.target.value })}
              placeholder="e.g., money worries, career uncertainty..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="would-pay">They&apos;d pay $1000 right now to solve ______</Label>
            <Input
              id="would-pay"
              value={validations.wouldPay}
              onChange={(e) => setValidations({ ...validations, wouldPay: e.target.value })}
              placeholder="e.g., time management, consistent income..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}