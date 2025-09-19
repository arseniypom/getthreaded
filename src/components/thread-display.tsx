'use client';

import { PostCard } from '@/components/post-card';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw } from 'lucide-react';
import type { ThreadPost } from '@/lib/types';
import { useState } from 'react';

interface ThreadDisplayProps {
  posts: ThreadPost[];
  onReset: () => void;
}

export function ThreadDisplay({ posts, onReset }: ThreadDisplayProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = async () => {
    try {
      const allContent = posts.map((post, index) =>
        `Post ${index + 1}:\n${post.content}`
      ).join('\n\n---\n\n');

      await navigator.clipboard.writeText(allContent);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (error) {
      console.error('Failed to copy all posts:', error);
    }
  };

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Thread</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {posts.length} posts generated
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopyAll}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            {copiedAll ? 'Copied All!' : 'Copy All'}
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Thread
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      <div className="pt-6 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>Ready to post? Copy individual posts or all at once.</p>
          <p className="mt-1">Each post is optimized for Threads&apos; 500 character limit.</p>
        </div>
      </div>
    </div>
  );
}