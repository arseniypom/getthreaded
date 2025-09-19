'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';

interface ThreadGeneratorProps {
  onGenerate: (idea: string, multiPost: boolean, longer: boolean) => Promise<void>;
  isLoading: boolean;
  multiPost: boolean;
  setMultiPost: (value: boolean) => void;
  longer: boolean;
  setLonger: (value: boolean) => void;
}

const placeholders = [
  "Different data types in JavaScript",
  "How to build a personal brand",
  "React best practices in 2025",
  "Morning routine tips for productivity",
  "Understanding Web3 basics"
];

export function ThreadGenerator({
  onGenerate,
  isLoading,
  multiPost,
  setMultiPost,
  longer,
  setLonger
}: ThreadGeneratorProps) {
  const [idea, setIdea] = useState('');
  const [placeholder, setPlaceholder] = useState("What's your idea?");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim() && !isLoading) {
      await onGenerate(idea, multiPost, longer);
      setIdea('');
    }
  };

  useEffect(() => {
    const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
    setPlaceholder(randomPlaceholder);
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-medium">
              Generating your {multiPost ? 'thread' : 'post'}...
            </span>
          </div>
          <div className="space-y-3">
            {multiPost ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : (
              <Skeleton className="h-32 w-full" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="idea" className="block text-sm font-medium mb-2">
              What&apos;s your idea?
            </label>
            <Textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={placeholder}
              className="min-h-[120px] resize-none"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter any topic or idea and we&apos;ll create {multiPost ? 'a multi-post Thread' : 'a single post'} for you
            </p>
          </div>

          {/* Settings Switches */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="multi-post" className="text-sm font-medium">
                  Multi-post thread
                </Label>
                <p className="text-xs text-muted-foreground">
                  Create a thread of multiple connected posts
                </p>
              </div>
              <Switch
                id="multi-post"
                checked={multiPost}
                onCheckedChange={setMultiPost}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="longer-format" className="text-sm font-medium">
                  Longer format
                </Label>
                <p className="text-xs text-muted-foreground">
                  {longer ? 'More detailed and explanatory' : 'Shorter and punchier'}
                </p>
              </div>
              <Switch
                id="longer-format"
                checked={longer}
                onCheckedChange={setLonger}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={!idea.trim() || isLoading}
          >
            <Sparkles className="h-4 w-4" />
            Generate {multiPost ? 'Thread' : 'Post'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}