'use client';

import { useState } from 'react';
import { ThreadGenerator } from '@/components/thread-generator';
import { ThreadDisplay } from '@/components/thread-display';
import { useThreadGenerator } from '@/hooks/use-thread-generator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export default function Home() {
  const [multiPost, setMultiPost] = useState(false);
  const [longer, setLonger] = useState(false);
  const { posts, isLoading, error, generateThread, resetThread } = useThreadGenerator();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Create</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-12">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-3">
                Create Threads
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
                  multiPost={multiPost}
                  setMultiPost={setMultiPost}
                  longer={longer}
                  setLonger={setLonger}
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
          </div>
        </div>
      </div>
    </>
  );
}