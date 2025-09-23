'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

type FeedbackType = 'like' | 'dislike' | null;

interface UseFeedbackProps {
  generationId: string | undefined;
  initialFeedback?: FeedbackType;
}

export function useThreadFeedback({ generationId, initialFeedback = null }: UseFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackType>(initialFeedback);

  const feedbackMutation = useMutation({
    mutationFn: async ({ type, id }: { type: FeedbackType; id: string }) => {
      if (type === null) {
        // Remove feedback
        const response = await fetch(`/api/threads/${id}/feedback`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove feedback');
        }

        return response.json();
      }

      // Add like or dislike
      const endpoint = type === 'like' ? 'like' : 'dislike';
      const response = await fetch(`/api/threads/${id}/${endpoint}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${type} thread`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      setFeedback(variables.type);
    },
  });

  const handleFeedback = useCallback(
    (type: FeedbackType) => {
      if (!generationId) return;

      // If clicking the same feedback, remove it
      const newFeedback = feedback === type ? null : type;

      feedbackMutation.mutate({ type: newFeedback, id: generationId });
    },
    [generationId, feedback, feedbackMutation]
  );

  return {
    feedback,
    handleLike: () => handleFeedback('like'),
    handleDislike: () => handleFeedback('dislike'),
    isLoading: feedbackMutation.isPending,
    error: feedbackMutation.error?.message,
  };
}