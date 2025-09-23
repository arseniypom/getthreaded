# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build production version with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Overview

GetThreaded is a Next.js 15 application with three main features:
1. **Thread Generation**: Creates multi-post social media threads using OpenAI's API
2. **Threads Scraping**: Scrapes posts from Threads.net profiles using Playwright
3. **Strategy Generation**: Creates personalized content strategies based on user profiles

## Architecture

### Core Features

**Thread Generation** (`/`)
- Uses OpenAI GPT-5-nano model for content generation
- Supports single post (280/500 chars) or multi-post threads (3-7 posts)
- Dynamic prompts based on post length and multi-post settings

**Threads Scraper** (`/insights`)
- Browser automation with Playwright for Threads.net scraping
- Security layers: rate limiting, resource management, URL validation
- Caching with NodeCache for performance
- Anti-detection measures for reliable scraping

**Strategy Generator** (`/strategy`)
- Multi-step wizard for profile creation
- Generates comprehensive content strategies via OpenAI
- Includes posting schedules, templates, and personalized tips

### API Routes

- `/api/generate-thread`: Thread content generation
- `/api/scrape-threads`: Threads.net profile scraping with security controls
- `/api/generate-strategy/*`: Multiple endpoints for strategy components
  - `about-me`, `about-audience`, `challenge`, `insights`, `tips`, `posting-strategy`, `post-templates`

### Security Architecture

- **Rate Limiting**: IP-based and global limits using rate-limiter-flexible
- **Resource Management**: Controls concurrent operations and system capacity
- **URL Validation**: Strict validation for Threads.net URLs only
- **Error Handling**: Centralized security event logging and safe error responses
- **Middleware**: Request validation and security headers

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **UI**: Shadcn/ui components (New York style)
- **State**: TanStack Query for server state
- **AI**: OpenAI SDK (GPT-5-nano model)
- **Scraping**: Playwright for browser automation
- **Validation**: Zod schemas

### Environment Variables

Required in `.env.local`:
- `OPENAI_API_KEY`: OpenAI API key for content generation

### Key Implementation Details

- Client components use `'use client'` directive
- API routes return proper TypeScript interfaces
- Character limits: 280 (short) / 500 (long) characters per post
- Threads scraper includes anti-detection and rate limiting
- Strategy generation uses structured JSON responses from OpenAI