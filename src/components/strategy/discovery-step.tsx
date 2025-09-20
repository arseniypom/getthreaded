'use client'

import { UserProfile, Niche, NICHE_OPTIONS } from '@/lib/strategy-types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain, DollarSign, Users, Lightbulb, Rocket, Zap, Heart,
  Activity, Cpu, MessageSquare, BookOpen, Film, Code, Clock,
  UserCheck, Globe, HeartHandshake, Mountain, Library
} from 'lucide-react'
import { useState } from 'react'

interface DiscoveryStepProps {
  profile: Partial<UserProfile>
  onUpdate: (updates: Partial<UserProfile>) => void
}

const NICHE_ICONS: Record<Niche, React.ElementType> = {
  'Mindset & Discipline': Brain,
  'Money, Business & Side Hustles': DollarSign,
  'Psychology & Human Behavior': Users,
  'Life Advice & Perspective Shifts': Lightbulb,
  'Science & Space Curiosity': Rocket,
  'Productivity & High Performance': Zap,
  'Spirituality & Stillness': Heart,
  'Health, Fitness & Biohacking': Activity,
  'AI, Tech & Future Trends': Cpu,
  'Controversial Opinions & Social Truths': MessageSquare,
  'Philosophy & Deep Thinking': BookOpen,
  'Movies, TV & Hidden Lessons': Film,
  'Digital Skills & Online Income': Code,
  'History & Hidden Stories': Clock,
  'Human Nature & Dating Psychology': UserCheck,
  'Modern Society Critics': Globe,
  'Book Summaries & Life Lessons': Library,
  'Travel & Global Curiosities': Globe,
  'Mental Health & Inner Battles': HeartHandshake,
  'Stoicism & Modern Life': Mountain
}

export function DiscoveryStep({ profile, onUpdate }: DiscoveryStepProps) {
  const [selectedNiches, setSelectedNiches] = useState<Niche[]>(() => {
    const niches: Niche[] = []
    if (profile.niches?.primary) niches.push(profile.niches.primary)
    if (profile.niches?.secondary) niches.push(profile.niches.secondary)
    return niches
  })

  const handleNicheSelect = (niche: Niche) => {
    let newSelection = [...selectedNiches]

    if (selectedNiches.includes(niche)) {
      newSelection = selectedNiches.filter(n => n !== niche)
    } else if (selectedNiches.length < 2) {
      newSelection.push(niche)
    } else {
      newSelection = [selectedNiches[1], niche]
    }

    setSelectedNiches(newSelection)

    onUpdate({
      niches: {
        primary: newSelection[0],
        secondary: newSelection[1]
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">What&apos;s Your Content DNA?</h2>
        <p className="text-muted-foreground">
          Let&apos;s find your unique voice in 30 seconds: select your primary and secondary niche
        </p>
      </div>

      {selectedNiches.length > 0 && (
        <div className="flex justify-center gap-2 mb-4">
          {selectedNiches.map((niche, index) => (
            <Badge key={niche} variant="default" className="px-3 py-1">
              {index === 0 ? 'Primary: ' : 'Secondary: '}{niche}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {NICHE_OPTIONS.map((niche) => {
          const Icon = NICHE_ICONS[niche]
          const isSelected = selectedNiches.includes(niche)
          const isPrimary = selectedNiches[0] === niche

          return (
            <Card
              key={niche}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? isPrimary
                    ? 'ring-2 ring-primary shadow-lg scale-105'
                    : 'ring-2 ring-primary/60 shadow-md'
                  : 'hover:shadow-md hover:scale-102'
              }`}
              onClick={() => handleNicheSelect(niche)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon className={`h-8 w-8 ${
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <p className={`text-sm font-medium ${
                    isSelected ? 'text-primary' : ''
                  }`}>
                    {niche}
                  </p>
                  {isSelected && (
                    <Badge variant="secondary" className="text-xs">
                      {isPrimary ? '1st' : '2nd'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Select up to 2 niches • Click again to deselect</p>
      </div>
    </div>
  )
}