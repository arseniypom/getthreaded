# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (opens http://localhost:3000)
- `npm run build` - Build production version with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Architecture

GetThreaded is a Next.js 15 application that generates multi-post social media threads using OpenAI's API. The app uses the App Router architecture with TypeScript.

### Key Components Structure

- **Main Page** (`src/app/page.tsx`): Client component that conditionally renders either the thread generator or thread display based on state
- **Thread Generator** (`src/components/thread-generator.tsx`): Form component for user input with loading states and placeholder examples
- **Thread Display** (`src/components/thread-display.tsx`): Shows generated thread posts with copy/reset functionality
- **API Route** (`src/app/api/generate-thread/route.ts`): Handles OpenAI integration with proper error handling and response formatting

### Data Flow

1. User enters idea in ThreadGenerator component
2. `useThreadGenerator` hook manages state and API calls via React Query
3. API route calls OpenAI with system prompt from constants
4. Response is parsed and validated, then displayed in ThreadDisplay

### Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: Shadcn/ui with New York style variant
- **State Management**: TanStack Query for server state
- **AI Integration**: OpenAI SDK for thread generation
- **Icons**: Lucide React

### Configuration

- **Shadcn/ui**: Configured in `components.json` with New York style, RSC enabled, path aliases set up
- **TypeScript**: Strict mode enabled with path mapping (`@/*` -> `./src/*`)
- **Environment**: Requires `OPENAI_API_KEY` in `.env.local`

### File Organization

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles with Tailwind
│   └── providers.tsx   # Query Client provider
├── components/
│   ├── ui/             # Shadcn/ui components
│   └── [feature].tsx   # Feature components
├── hooks/              # Custom React hooks
└── lib/                # Utilities, types, constants
```

### Important Patterns

- All client components explicitly marked with `'use client'`
- API routes use proper TypeScript interfaces from `@/lib/types`
- Error handling implemented at both API and component levels
- Character limits and system prompts defined in `@/lib/constants`