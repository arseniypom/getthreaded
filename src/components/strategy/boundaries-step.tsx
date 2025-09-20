'use client'

import { UserProfile } from '@/lib/strategy-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

interface BoundariesStepProps {
  profile: Partial<UserProfile>
  onUpdate: (updates: Partial<UserProfile>) => void
}

export function BoundariesStep({ profile, onUpdate }: BoundariesStepProps) {
  const [boundaries, setBoundaries] = useState(
    profile.boundaries || {
      contentBoundaries: {},
      operationalConstraints: {},
      nicheSpecific: {}
    }
  )

  const updateBoundary = (
    category: 'contentBoundaries' | 'operationalConstraints' | 'nicheSpecific',
    key: string,
    value: boolean
  ) => {
    const updated = {
      ...boundaries,
      [category]: {
        ...boundaries[category],
        [key]: value
      }
    }
    setBoundaries(updated)
    onUpdate({ boundaries: updated })
  }

  const getNicheSpecificOptions = () => {
    const options = []

    if (profile.niches?.primary?.includes('Coaching') || profile.niches?.secondary?.includes('Coaching')) {
      options.push({
        key: 'noClientDetails',
        label: 'No client details',
        description: 'Keep all examples anonymous'
      })
    }

    if (profile.niches?.primary?.includes('Money') || profile.niches?.secondary?.includes('Money') ||
        profile.niches?.primary?.includes('Business') || profile.niches?.secondary?.includes('Business')) {
      options.push({
        key: 'noFinancialAdvice',
        label: 'No financial advice',
        description: 'Educational content only, include disclaimers'
      })
    }

    if (profile.niches?.primary?.includes('Health') || profile.niches?.secondary?.includes('Health') ||
        profile.niches?.primary?.includes('Fitness') || profile.niches?.secondary?.includes('Fitness')) {
      options.push({
        key: 'noMedicalClaims',
        label: 'No medical claims',
        description: 'Wellness tips only, not treatment advice'
      })
    }

    return options
  }

  const nicheOptions = getNicheSpecificOptions()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Anything We Should Know?</h2>
        <p className="text-muted-foreground">
          Set any additional boundaries or preferences for your content strategy
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Core Constraints</CardTitle>
          <CardDescription>Your operational preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="no-dms"
              checked={boundaries.operationalConstraints?.noDMs || false}
              onCheckedChange={(checked) =>
                updateBoundary('operationalConstraints', 'noDMs', checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label htmlFor="no-dms" className="font-medium cursor-pointer">
                I don&apos;t want to use DMs
              </Label>
              <p className="text-sm text-muted-foreground">
                All lead generation through public comments instead
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="no-swearing"
              checked={boundaries.operationalConstraints?.noSwearing || false}
              onCheckedChange={(checked) =>
                updateBoundary('operationalConstraints', 'noSwearing', checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label htmlFor="no-swearing" className="font-medium cursor-pointer">
                No swearing
              </Label>
              <p className="text-sm text-muted-foreground">
                Keep content completely clean regardless of voice settings
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="prefer-qa"
              checked={boundaries.operationalConstraints?.preferQA || false}
              onCheckedChange={(checked) =>
                updateBoundary('operationalConstraints', 'preferQA', checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label htmlFor="prefer-qa" className="font-medium cursor-pointer">
                I prefer Q&A style posts
              </Label>
              <p className="text-sm text-muted-foreground">
                Prioritize question-based and interactive formats
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="no-weekends"
              checked={boundaries.operationalConstraints?.noWeekends || false}
              onCheckedChange={(checked) =>
                updateBoundary('operationalConstraints', 'noWeekends', checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label htmlFor="no-weekends" className="font-medium cursor-pointer">
                I can&apos;t post weekends
              </Label>
              <p className="text-sm text-muted-foreground">
                Schedule Monday through Friday only
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Boundaries</CardTitle>
          <CardDescription>Topics and content types to avoid</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="no-politics"
              checked={boundaries.contentBoundaries?.noPoliticsReligion || false}
              onCheckedChange={(checked) =>
                updateBoundary('contentBoundaries', 'noPoliticsReligion', checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label htmlFor="no-politics" className="font-medium cursor-pointer">
                No politics or religion
              </Label>
              <p className="text-sm text-muted-foreground">
                Avoid divisive topics that alienate audience segments
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="no-numbers"
              checked={boundaries.contentBoundaries?.noSpecificNumbers || false}
              onCheckedChange={(checked) =>
                updateBoundary('contentBoundaries', 'noSpecificNumbers', checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label htmlFor="no-numbers" className="font-medium cursor-pointer">
                No specific numbers
              </Label>
              <p className="text-sm text-muted-foreground">
                Don&apos;t share revenue, prices, or income claims
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="text-only"
              checked={boundaries.contentBoundaries?.textOnly || false}
              onCheckedChange={(checked) =>
                updateBoundary('contentBoundaries', 'textOnly', checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label htmlFor="text-only" className="font-medium cursor-pointer">
                Text only, no personal media
              </Label>
              <p className="text-sm text-muted-foreground">
                Don&apos;t require photos or videos of me
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {nicheOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Niche-Specific Constraints</CardTitle>
            <CardDescription>Based on your selected niches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nicheOptions.map((option) => (
              <div key={option.key} className="flex items-start space-x-3">
                <Checkbox
                  id={option.key}
                  checked={boundaries.nicheSpecific?.[option.key as keyof typeof boundaries.nicheSpecific] || false}
                  onCheckedChange={(checked) =>
                    updateBoundary('nicheSpecific', option.key, checked as boolean)
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor={option.key} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}