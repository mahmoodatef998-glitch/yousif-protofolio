'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageSquare, Eye, Star } from 'lucide-react';

interface ContentInteractionProps {
  contentId: string;
  initialLikes?: number;
  initialViews?: number;
  initialRating?: number;
  showReviewButton?: boolean;
}

export function ContentInteraction({
  contentId,
  initialLikes = 0,
  initialViews = 0,
  initialRating = 0,
  showReviewButton = true,
}: ContentInteractionProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [views, setViews] = useState(initialViews);
  const [rating, setRating] = useState(initialRating);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/content/interaction?contentId=${contentId}`);
        if (response.ok) {
          const data = await response.json();
          setLikes(data.likes || 0);
          setViews(data.views || 0);
          setRating(data.rating || 0);
        }
      } catch (error) {
        console.error('Error fetching interaction data:', error);
      }
    };
    fetchData();
  }, [contentId]);

  // Check if already liked (using localStorage)
  useEffect(() => {
    const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
    setIsLiked(likedItems.includes(contentId));
  }, [contentId]);

  // Track view on mount
  useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch('/api/content/interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentId,
            type: 'view',
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.views !== undefined) {
            setViews(data.views);
          }
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };
    trackView();
  }, [contentId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    const newLikedState = !isLiked;
    
    try {
      const response = await fetch('/api/content/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          type: newLikedState ? 'like' : 'unlike',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(newLikedState);
        if (data.likes !== undefined) {
          setLikes(data.likes);
        } else {
          setLikes((prev) => newLikedState ? prev + 1 : Math.max(0, prev - 1));
        }
        
        // Save to localStorage
        const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
        if (newLikedState) {
          localStorage.setItem('likedItems', JSON.stringify([...likedItems, contentId]));
        } else {
          localStorage.setItem('likedItems', JSON.stringify(likedItems.filter((id: string) => id !== contentId)));
        }
      }
    } catch (error) {
      console.error('Error liking content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReviewModal(true);
  };

  return (
    <>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isLiked
                ? 'bg-red-500/80 text-white'
                : 'bg-dark-bg/60 text-text-secondary hover:text-red-400 hover:bg-dark-bg/80'
            }`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likes}</span>
          </button>

          {/* Review Button */}
          {showReviewButton && (
            <button
              onClick={handleReviewClick}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-dark-bg/60 text-text-secondary hover:text-accent hover:bg-dark-bg/80 backdrop-blur-sm transition-all duration-300"
              aria-label="Add review"
            >
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">{rating > 0 ? rating.toFixed(1) : 'Rate'}</span>
            </button>
          )}

          {/* Views Counter */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-dark-bg/60 text-text-secondary backdrop-blur-sm">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">{views}</span>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          contentId={contentId}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={(newRating) => {
            setRating(newRating);
            setShowReviewModal(false);
          }}
        />
      )}
    </>
  );
}

// Review Modal Component
function ReviewModal({
  contentId,
  onClose,
  onReviewSubmitted,
}: {
  contentId: string;
  onClose: () => void;
  onReviewSubmitted: (rating: number) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/content/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          rating,
          comment: comment.trim() || null,
          name: name.trim() || null,
        }),
      });

      if (response.ok) {
        onReviewSubmitted(rating);
        alert('Thank you for your review! It will be reviewed before being published.');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-dark-bg/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-section rounded-2xl p-8 max-w-md w-full border border-dark-bg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-text-primary mb-6">Rate this content</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-text-secondary mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform duration-200 hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-accent text-accent'
                        : 'text-text-secondary'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name (Optional) */}
          <div>
            <label className="block text-text-secondary mb-2">Name (Optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="Your name"
            />
          </div>

          {/* Comment (Optional) */}
          <div>
            <label className="block text-text-secondary mb-2">Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
              placeholder="Share your thoughts..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-dark-bg border border-dark-section rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-6 py-3 bg-accent text-dark-bg font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

