import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackProps {
  responseId: string;
}

const Feedback: React.FC<FeedbackProps> = ({ responseId }) => {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  useEffect(() => {
    const storedFeedback = localStorage.getItem(responseId);
    if (storedFeedback === 'like' || storedFeedback === 'dislike') {
      setFeedback(storedFeedback as 'like' | 'dislike');
    }
  }, [responseId]);

  const handleFeedback = (newFeedback: 'like' | 'dislike') => {
    localStorage.setItem(responseId, newFeedback);
    setFeedback(newFeedback);
  };

  const hasGivenFeedback = feedback !== null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">هل كانت هذه الإجابة مفيدة؟</p>
      <button
        onClick={() => handleFeedback('like')}
        disabled={hasGivenFeedback}
        className={`p-2 rounded-full transition-colors ${
          feedback === 'like'
            ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
            : 'hover:bg-green-100 dark:hover:bg-green-500/20 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
        } disabled:cursor-not-allowed disabled:opacity-70`}
        aria-label="إجابة مفيدة"
      >
        <ThumbsUp size={18} />
      </button>
      <button
        onClick={() => handleFeedback('dislike')}
        disabled={hasGivenFeedback}
        className={`p-2 rounded-full transition-colors ${
          feedback === 'dislike'
            ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
            : 'hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
        } disabled:cursor-not-allowed disabled:opacity-70`}
        aria-label="إجابة غير مفيدة"
      >
        <ThumbsDown size={18} />
      </button>
    </div>
  );
};

export default Feedback;