'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { UserProfile } from '@/lib/strategy-types'
import { PersonalStep } from '@/components/strategy/personal-step'
import { DiscoveryStep } from '@/components/strategy/discovery-step'
import { FocusRefinementStep } from '@/components/strategy/focus-refinement-step'
import { VoiceStep } from '@/components/strategy/voice-step'
import { AudienceDiscoveryStep } from '@/components/strategy/audience-discovery-step'
import { BoundariesStep } from '@/components/strategy/boundaries-step'
import { StrategyDashboard } from '@/components/strategy/strategy-dashboard'

const TOTAL_STEPS = 6

export default function StrategyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showDashboard, setShowDashboard] = useState(false)

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    voice: {
      matrix: {
        casual: 50,
        professional: 50,
        bold: 50,
        thoughtful: 50
      },
      signatureMoves: [],
      nonNegotiables: {
        emojiUsage: 'strategic',
        humorStyle: 'none',
        controversyComfort: 'careful',
        personalSharing: 'selective',
        ctaStyle: 'soft-nudge'
      }
    },
    boundaries: {
      contentBoundaries: {},
      operationalConstraints: {},
      nicheSpecific: {}
    }
  })

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    } else if (!showDashboard) {
      setShowDashboard(true)
    }
  }

  const handleBack = () => {
    if (showDashboard) {
      setShowDashboard(false)
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...updates
    }))
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profile.personal?.name &&
               profile.personal?.handle &&
               profile.personal?.journeyStage &&
               profile.personal?.workPreferences?.style &&
               profile.personal?.workPreferences?.contentType &&
               profile.personal?.workPreferences?.focus &&
               profile.personal?.workPreferences?.creatorType
      case 2:
        return profile.niches?.primary
      case 3:
        return profile.pillars && profile.pillars.length >= 2
      case 4:
        return profile.voice?.signatureMoves && profile.voice.signatureMoves.length >= 2
      case 5:
        return profile.audience?.demographics?.ageRange &&
               profile.audience?.psychographics?.dailyReality?.length > 0 &&
               profile.audience?.psychographics?.painPoints?.length > 0
      case 6:
        return true // Boundaries are all optional
      default:
        return true
    }
  }

  if (showDashboard) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Setup
          </Button>
        </div>
        <StrategyDashboard profile={profile as UserProfile} />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Create Your Strategy</h1>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <PersonalStep
              profile={profile}
              onUpdate={updateProfile}
            />
          )}
          {currentStep === 2 && (
            <DiscoveryStep
              profile={profile}
              onUpdate={updateProfile}
            />
          )}
          {currentStep === 3 && (
            <FocusRefinementStep
              profile={profile}
              onUpdate={updateProfile}
            />
          )}
          {currentStep === 4 && (
            <VoiceStep
              profile={profile}
              onUpdate={updateProfile}
            />
          )}
          {currentStep === 5 && (
            <AudienceDiscoveryStep
              profile={profile}
              onUpdate={updateProfile}
            />
          )}
          {currentStep === 6 && (
            <BoundariesStep
              profile={profile}
              onUpdate={updateProfile}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          {currentStep === TOTAL_STEPS ? (
            <>
              View Your Playbook
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}