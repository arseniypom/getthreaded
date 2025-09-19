'use client';

import { ThreadGenerator } from '@/components/thread-generator';
import { ThreadDisplay } from '@/components/thread-display';
import { useThreadGenerator } from '@/hooks/use-thread-generator';

export default function Home() {
  const { posts, isLoading, error, generateThread, resetThread } = useThreadGenerator();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            GetThreaded
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into engaging multi-post Threads instantly.
            Powered by AI, optimized for engagement.
          </p>
        </header>

        <main className="space-y-12">
          {posts.length === 0 ? (
            <ThreadGenerator
              onGenerate={generateThread}
              isLoading={isLoading}
            />
          ) : (
            <ThreadDisplay
              posts={posts}
              onReset={resetThread}
            />
          )}

          {error && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-20 text-center text-sm text-muted-foreground">
          <p>Create compelling Threads content in seconds</p>
        </footer>
      </div>
    </div>
  );
}