import { NextResponse } from 'next/server'
import { UserProfile } from '@/lib/strategy-types'

// Test endpoint to verify strategy generation
export async function GET() {
  const testProfile: UserProfile = {
    personal: {
      name: "Test User",
      handle: "@testuser",
      journeyStage: "building",
      context: "Want to grow my coaching business",
      goals: {
        primary: "Get 10 coaching clients in 3 months",
        secondary: "Build email list of 1000 subscribers",
        timeframe: "3-months"
      }
    },
    niches: {
      primary: "Productivity & High Performance",
      secondary: "Mindset & Discipline"
    },
    pillars: [
      "System Optimization Hacks",
      "Energy Management Tactics",
      "Mental Toughness Training"
    ],
    voice: {
      matrix: {
        casual: 30,
        professional: 70,
        bold: 75,
        thoughtful: 25
      },
      signatureMoves: ["hook-master", "myth-buster"],
      nonNegotiables: {
        emojiUsage: "strategic",
        humorStyle: "dry-wit",
        controversyComfort: "embrace",
        personalSharing: "selective",
        ctaStyle: "direct-ask"
      }
    },
    audience: {
      demographics: {
        ageRange: { min: 25, max: 40 },
        genderMix: "mixed",
        location: "Urban US"
      },
      psychographics: {
        dailyReality: ["career-focused", "side-hustle"],
        painPoints: ["no-time", "career-stuck", "info-overload"],
        aspirations: ["freedom", "growth", "impact"]
      }
    },
    boundaries: {
      contentBoundaries: {
        noPoliticsReligion: true,
        noSpecificNumbers: false,
        textOnly: false
      },
      operationalConstraints: {
        noDMs: true,
        noSwearing: true,
        preferQA: false,
        noWeekends: true
      },
      nicheSpecific: {
        noClientDetails: true
      }
    }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/generate-strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: testProfile })
    })

    if (!response.ok) {
      throw new Error(`Strategy generation failed: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      message: "Strategy generation test successful",
      strategy: data.strategy
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}