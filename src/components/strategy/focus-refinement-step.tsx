'use client'

import { UserProfile, PILLAR_OPTIONS } from '@/lib/strategy-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

interface FocusRefinementStepProps {
  profile: Partial<UserProfile>
  onUpdate: (updates: Partial<UserProfile>) => void
}

export function FocusRefinementStep({ profile, onUpdate }: FocusRefinementStepProps) {
  const [selectedPillars, setSelectedPillars] = useState<string[]>(
    profile.pillars || []
  )
  const [availablePillars, setAvailablePillars] = useState<string[]>([])

  useEffect(() => {
    const pillars: string[] = []

    if (profile.niches?.primary) {
      pillars.push(...PILLAR_OPTIONS[profile.niches.primary])
    }

    if (profile.niches?.secondary) {
      pillars.push(...PILLAR_OPTIONS[profile.niches.secondary])
    }

    setAvailablePillars(pillars)
  }, [profile.niches])

  const handlePillarToggle = (pillar: string) => {
    let newSelection = [...selectedPillars]

    if (selectedPillars.includes(pillar)) {
      newSelection = selectedPillars.filter(p => p !== pillar)
    } else if (selectedPillars.length < 3) {
      newSelection.push(pillar)
    } else {
      newSelection = [...selectedPillars.slice(1), pillar]
    }

    setSelectedPillars(newSelection)
    onUpdate({ pillars: newSelection })
  }

  const getPopularCombos = () => {
    const combos = []

    if (profile.niches?.primary === 'Mindset & Discipline') {
      combos.push(['Mental Toughness Training', 'Daily Systems Building'])
    }
    if (profile.niches?.primary === 'Money, Business & Side Hustles') {
      combos.push(['Income Stream Building', 'Business Model Breakdowns'])
    }
    if (profile.niches?.primary === 'Health, Fitness & Biohacking') {
      combos.push(['Evidence-Based Protocols', 'Workout Myth-Busting'])
    }

    return combos.slice(0, 2)
  }

  const applyCombo = (combo: string[]) => {
    setSelectedPillars(combo)
    onUpdate({ pillars: combo })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Now, Let&apos;s Get Specific</h2>
        <p className="text-muted-foreground">
          Choose 2-3 content pillars that excite you most
        </p>
      </div>


      <div className="space-y-3">
        {availablePillars.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {availablePillars.map((pillar) => {
              const isSelected = selectedPillars.includes(pillar)
              return (
                <Button
                  key={pillar}
                  variant={isSelected ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handlePillarToggle(pillar)}
                  className={`transition-all ${
                    isSelected ? 'scale-105 shadow-md' : ''
                  }`}
                >
                  {pillar}
                </Button>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Please select your niches in the previous step first
            </CardContent>
          </Card>
        )}
      </div>

      {availablePillars.length > 0 && getPopularCombos().length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Popular combos that work well together</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {getPopularCombos().map((combo, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => applyCombo(combo)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Combo {index + 1}:</span>
                    {combo.map((item, i) => (
                      <span key={i}>
                        {item}
                        {i < combo.length - 1 && ' + '}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <p>Select 2-3 pillars • Click again to deselect</p>
      </div>
    </div>
  )
}