'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ExpandableTextProps {
  text: string;
  className?: string;
  url?: string | null;
}

export function ExpandableText({ text, className, url }: ExpandableTextProps) {
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        // Check if text is overflowing
        setIsTruncated(
          textRef.current.scrollHeight > textRef.current.clientHeight ||
          textRef.current.scrollWidth > textRef.current.clientWidth
        );
      }
    };

    checkTruncation();
    // Re-check on window resize
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text]);

  if (!text) {
    return <span className="text-muted-foreground text-sm">No text content</span>;
  }

  const truncatedContent = (
    <div
      ref={textRef}
      className={cn(
        "text-sm text-ellipsis overflow-hidden",
        className
      )}
      style={{
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word'
      }}
    >
      {text}
    </div>
  );

  // If not truncated, just return the text as is
  if (!isTruncated) {
    return truncatedContent;
  }

  // Mobile: Use Dialog
  const mobileView = (
    <Dialog>
      <DialogTrigger asChild>
        <div className="lg:hidden cursor-pointer">
          {truncatedContent}
          <span className="text-xs text-blue-600 hover:text-blue-800 inline-block mt-1">
            Show more...
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Full Post</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-3"
            >
              View on Threads →
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Desktop: Use Tooltip
  const desktopView = (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="hidden lg:block cursor-help">
            {truncatedContent}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-md max-h-96 overflow-y-auto p-3"
          sideOffset={5}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
}