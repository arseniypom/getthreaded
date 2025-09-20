'use client'

import { UserProfile, SignatureMove, EmojiUsage, HumorStyle, ControversyComfort, PersonalSharing, CTAStyle } from '@/lib/strategy-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useState } from 'react'
import {
  MessageSquare, BookOpen, Sparkles, BarChart,
  Search, Target
} from 'lucide-react'

interface VoiceStepProps {
  profile: Partial<UserProfile>
  onUpdate: (updates: Partial<UserProfile>) => void
}

export function VoiceStep({ profile, onUpdate }: VoiceStepProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [selectedMoves, setSelectedMoves] = useState<SignatureMove[]>(
    profile.voice?.signatureMoves || []
  )
  const [nonNegotiables, setNonNegotiables] = useState(
    profile.voice?.nonNegotiables || {
      emojiUsage: 'strategic' as EmojiUsage,
      humorStyle: 'none' as HumorStyle,
      controversyComfort: 'careful' as ControversyComfort,
      personalSharing: 'selective' as PersonalSharing,
      ctaStyle: 'soft-nudge' as CTAStyle
    }
  )

  const signatureMoveOptions = [
    {
      id: 'hook-master' as SignatureMove,
      icon: MessageSquare,
      title: 'The Hook Master',
      description: 'Opens with questions that stop the scroll'
    },
    {
      id: 'storyteller' as SignatureMove,
      icon: BookOpen,
      title: 'The Storyteller',
      description: 'Weaves personal anecdotes into lessons'
    },
    {
      id: 'myth-buster' as SignatureMove,
      icon: Sparkles,
      title: 'The Myth Buster',
      description: 'Challenges common beliefs'
    },
    {
      id: 'data-dropper' as SignatureMove,
      icon: BarChart,
      title: 'The Data Dropper',
      description: 'Backs claims with surprising stats'
    },
    {
      id: 'pattern-spotter' as SignatureMove,
      icon: Search,
      title: 'The Pattern Spotter',
      description: 'Connects dots others miss'
    },
    {
      id: 'straight-shooter' as SignatureMove,
      icon: Target,
      title: 'The Straight Shooter',
      description: 'No fluff, pure value'
    }
  ]

  const handleMatrixClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setPosition({ x, y })

    onUpdate({
      voice: {
        ...profile.voice!,
        matrix: {
          casual: 100 - x,
          professional: x,
          bold: 100 - y,
          thoughtful: y
        },
        signatureMoves: selectedMoves,
        nonNegotiables
      }
    })
  }

  const toggleSignatureMove = (move: SignatureMove) => {
    let newMoves = [...selectedMoves]

    if (selectedMoves.includes(move)) {
      newMoves = selectedMoves.filter(m => m !== move)
    } else if (selectedMoves.length < 3) {
      newMoves.push(move)
    } else {
      newMoves = [...selectedMoves.slice(1), move]
    }

    setSelectedMoves(newMoves)
    onUpdate({
      voice: {
        ...profile.voice!,
        matrix: {
          casual: 100 - position.x,
          professional: position.x,
          bold: 100 - position.y,
          thoughtful: position.y
        },
        signatureMoves: newMoves,
        nonNegotiables
      }
    })
  }

  const updateNonNegotiable = <K extends keyof typeof nonNegotiables>(
    key: K,
    value: typeof nonNegotiables[K]
  ) => {
    const updated = { ...nonNegotiables, [key]: value }
    setNonNegotiables(updated)
    onUpdate({
      voice: {
        ...profile.voice!,
        matrix: {
          casual: 100 - position.x,
          professional: position.x,
          bold: 100 - position.y,
          thoughtful: position.y
        },
        signatureMoves: selectedMoves,
        nonNegotiables: updated
      }
    })
  }

  const getVoiceDescription = () => {
    const x = position.x
    const y = position.y

    if (x < 50 && y < 50) return 'Casual & Bold'
    if (x >= 50 && y < 50) return 'Professional & Bold'
    if (x < 50 && y >= 50) return 'Casual & Thoughtful'
    return 'Professional & Thoughtful'
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Let&apos;s Capture Your Authentic Voice</h2>
        <p className="text-muted-foreground">
          We&apos;ll learn how you naturally communicate
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section 1: Voice Spectrum</CardTitle>
          <CardDescription>Click anywhere on the matrix to set your voice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg h-64 cursor-crosshair"
              onClick={handleMatrixClick}
            >
              <div className="absolute top-2 left-2 text-sm font-medium">Casual & Bold</div>
              <div className="absolute top-2 right-2 text-sm font-medium">Professional & Bold</div>
              <div className="absolute bottom-2 left-2 text-sm font-medium">Casual & Thoughtful</div>
              <div className="absolute bottom-2 right-2 text-sm font-medium">Professional & Thoughtful</div>

              <div
                className="absolute w-4 h-4 bg-primary rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 ring-2 ring-white"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              />

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                  {getVoiceDescription()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section 2: Your Signature Moves</CardTitle>
          <CardDescription>Pick 2-3 that feel most &quot;you&quot;</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {signatureMoveOptions.map((move) => {
              const Icon = move.icon
              const isSelected = selectedMoves.includes(move.id)

              return (
                <Card
                  key={move.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleSignatureMove(move.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Icon className={`h-5 w-5 mt-1 ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div>
                        <p className="font-medium">{move.title}</p>
                        <p className="text-sm text-muted-foreground">{move.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section 3: Your Non-Negotiables</CardTitle>
          <CardDescription>Draw your lines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Emoji usage</Label>
            <RadioGroup
              value={nonNegotiables.emojiUsage}
              onValueChange={(value) => updateNonNegotiable('emojiUsage', value as EmojiUsage)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="emoji-never" />
                <Label htmlFor="emoji-never">Never</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="strategic" id="emoji-strategic" />
                <Label htmlFor="emoji-strategic">Strategic</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="liberally" id="emoji-liberally" />
                <Label htmlFor="emoji-liberally">Liberally</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Humor style</Label>
            <RadioGroup
              value={nonNegotiables.humorStyle}
              onValueChange={(value) => updateNonNegotiable('humorStyle', value as HumorStyle)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dry-wit" id="humor-dry" />
                <Label htmlFor="humor-dry">Dry wit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="self-deprecating" id="humor-self" />
                <Label htmlFor="humor-self">Self-deprecating</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="observational" id="humor-obs" />
                <Label htmlFor="humor-obs">Observational</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="humor-none" />
                <Label htmlFor="humor-none">None</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Controversy comfort</Label>
            <RadioGroup
              value={nonNegotiables.controversyComfort}
              onValueChange={(value) => updateNonNegotiable('controversyComfort', value as ControversyComfort)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="avoid" id="controversy-avoid" />
                <Label htmlFor="controversy-avoid">Avoid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="careful" id="controversy-careful" />
                <Label htmlFor="controversy-careful">Careful</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="embrace" id="controversy-embrace" />
                <Label htmlFor="controversy-embrace">Embrace</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Personal sharing</Label>
            <RadioGroup
              value={nonNegotiables.personalSharing}
              onValueChange={(value) => updateNonNegotiable('personalSharing', value as PersonalSharing)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="sharing-private" />
                <Label htmlFor="sharing-private">Private</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selective" id="sharing-selective" />
                <Label htmlFor="sharing-selective">Selective</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="open-book" id="sharing-open" />
                <Label htmlFor="sharing-open">Open book</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Call-to-action style</Label>
            <RadioGroup
              value={nonNegotiables.ctaStyle}
              onValueChange={(value) => updateNonNegotiable('ctaStyle', value as CTAStyle)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="soft-nudge" id="cta-soft" />
                <Label htmlFor="cta-soft">Soft nudge</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct-ask" id="cta-direct" />
                <Label htmlFor="cta-direct">Direct ask</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="let-them-come" id="cta-passive" />
                <Label htmlFor="cta-passive">Let them come</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}