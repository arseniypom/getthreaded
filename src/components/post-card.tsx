'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import type { ThreadPost } from '@/lib/types';

interface PostCardProps {
  post: ThreadPost;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const characterCount = post.content.length;
  const isNearLimit = characterCount > 450;

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-lg">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      <div className="absolute top-4 left-4 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
        {index + 1}
      </div>
      <CardContent className="pt-4 pl-16 pr-6 pb-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {post.content}
        </p>
      </CardContent>
      <CardFooter className="pl-16 pr-6 pb-4 flex items-center justify-between">
        <span className={`text-xs ${isNearLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
          {characterCount}/500 characters
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}