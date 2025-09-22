import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { UserProfile, GeneratedStrategy } from '@/lib/strategy-types'

// API fetch functions
const fetchAboutMe = async (profile: UserProfile) => {
  const response = await fetch('/api/generate-strategy/about-me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate About Me')
  }

  const data = await response.json()
  return data.aboutMe
}

const fetchAboutAudience = async (profile: UserProfile) => {
  const response = await fetch('/api/generate-strategy/about-audience', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate About Audience')
  }

  const data = await response.json()
  return data.aboutAudience
}

const fetchInsights = async (profile: UserProfile) => {
  const response = await fetch('/api/generate-strategy/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate insights')
  }

  const data = await response.json()
  return data.personalInsights
}

const fetchPostingStrategy = async (profile: UserProfile) => {
  const response = await fetch('/api/generate-strategy/posting-strategy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate posting strategy')
  }

  const data = await response.json()
  return data.postingStrategy
}

const fetchPostTemplates = async (profile: UserProfile) => {
  const response = await fetch('/api/generate-strategy/post-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate post templates')
  }

  const data = await response.json()
  return data.posts
}

const fetchTips = async (profile: UserProfile) => {
  const response = await fetch('/api/generate-strategy/tips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate tips')
  }

  const data = await response.json()
  return data.tipsAndTricks
}

const fetchChallenge = async (profile: UserProfile) => {
  const response = await fetch('/api/generate-strategy/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate challenge')
  }

  const data = await response.json()
  return data.personalChallenge
}

// Custom hooks for each section
export const useGenerateAboutMe = (profile: UserProfile, enabled = true) => {
  return useQuery({
    queryKey: ['strategy', 'aboutMe', profile],
    queryFn: () => fetchAboutMe(profile),
    enabled,
    staleTime: Infinity, // Don't refetch automatically
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 1
  })
}

export const useGenerateAboutAudience = (profile: UserProfile, enabled = true) => {
  return useQuery({
    queryKey: ['strategy', 'aboutAudience', profile],
    queryFn: () => fetchAboutAudience(profile),
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1
  })
}

export const useGenerateInsights = (profile: UserProfile, enabled = true) => {
  return useQuery({
    queryKey: ['strategy', 'insights', profile],
    queryFn: () => fetchInsights(profile),
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1
  })
}

export const useGeneratePostingStrategy = (profile: UserProfile, enabled = true) => {
  return useQuery({
    queryKey: ['strategy', 'postingStrategy', profile],
    queryFn: () => fetchPostingStrategy(profile),
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1
  })
}

export const useGeneratePostTemplates = (profile: UserProfile, enabled = true) => {
  return useQuery({
    queryKey: ['strategy', 'postTemplates', profile],
    queryFn: () => fetchPostTemplates(profile),
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1
  })
}

export const useGenerateTips = (profile: UserProfile, enabled = true) => {
  return useQuery({
    queryKey: ['strategy', 'tips', profile],
    queryFn: () => fetchTips(profile),
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1
  })
}

export const useGenerateChallenge = (profile: UserProfile, enabled = true) => {
  return useQuery({
    queryKey: ['strategy', 'challenge', profile],
    queryFn: () => fetchChallenge(profile),
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1
  })
}

// Combine all strategy data
export interface StrategyQueries {
  aboutMe: UseQueryResult<GeneratedStrategy['aboutMe'], Error>
  aboutAudience: UseQueryResult<GeneratedStrategy['aboutAudience'], Error>
  insights: UseQueryResult<string[], Error>
  postingStrategy: UseQueryResult<GeneratedStrategy['postingStrategy'], Error>
  posts: UseQueryResult<GeneratedStrategy['posts'], Error>
  tips: UseQueryResult<GeneratedStrategy['tipsAndTricks'], Error>
  challenge: UseQueryResult<GeneratedStrategy['personalChallenge'], Error>
}

// Hook to use all strategy queries
export const useGenerateFullStrategy = (profile: UserProfile): StrategyQueries => {
  return {
    aboutMe: useGenerateAboutMe(profile),
    aboutAudience: useGenerateAboutAudience(profile),
    insights: useGenerateInsights(profile),
    postingStrategy: useGeneratePostingStrategy(profile),
    posts: useGeneratePostTemplates(profile),
    tips: useGenerateTips(profile),
    challenge: useGenerateChallenge(profile)
  }
}