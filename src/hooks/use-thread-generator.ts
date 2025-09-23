'use client';

import { useMutation } from '@tanstack/react-query';
import type { ThreadResponse } from '@/lib/types';

interface GenerateOptions {
  idea: string;
  multiPost: boolean;
  longer: boolean;
}

async function generateThread({ idea, multiPost, longer }: GenerateOptions): Promise<ThreadResponse> {
  const response = await fetch('/api/generate-thread', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idea, multiPost, longer }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate thread');
  }

  return response.json();
}

export function useThreadGenerator() {
  const mutation = useMutation<ThreadResponse, Error, GenerateOptions>({
    mutationFn: generateThread,
    onError: (error) => {
      console.error('Failed to generate thread:', error);
    },
  });

  const posts = mutation.data?.thread || [];
  const isLoading = mutation.isPending;
  const error = mutation.error?.message || null;
  const generationId = mutation.data?.generationId;

  const generateThreadAction = async (idea: string, multiPost: boolean, longer: boolean) => {
    await mutation.mutateAsync({ idea, multiPost, longer });
  };

  const resetThread = () => {
    mutation.reset();
  };

  return {
    posts,
    isLoading,
    error,
    generationId,
    generateThread: generateThreadAction,
    resetThread,
  };
}