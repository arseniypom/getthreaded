'use client';

import { useMutation } from '@tanstack/react-query';
import type { ThreadResponse } from '@/lib/types';

async function generateThread(idea: string): Promise<ThreadResponse> {
  const response = await fetch('/api/generate-thread', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idea }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate thread');
  }

  return response.json();
}

export function useThreadGenerator() {
  const mutation = useMutation<ThreadResponse, Error, string>({
    mutationFn: generateThread,
    onError: (error) => {
      console.error('Failed to generate thread:', error);
    },
  });

  const posts = mutation.data?.thread || [];
  const isLoading = mutation.isPending;
  const error = mutation.error?.message || null;

  const generateThreadAction = async (idea: string) => {
    await mutation.mutateAsync(idea);
  };

  const resetThread = () => {
    mutation.reset();
  };

  return {
    posts,
    isLoading,
    error,
    generateThread: generateThreadAction,
    resetThread,
  };
}