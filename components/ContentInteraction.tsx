'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

      {/* Review Modal - Using Portal to render outside card */}
      {showReviewModal && typeof window !== 'undefined' && createPortal(
        <ReviewModal
          contentId={contentId}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={(newRating) => {
            setRating(newRating);
            setShowReviewModal(false);
          }}
        />,
        document.body
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
      className="fixed inset-0 z-[9999] bg-dark-bg/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
      onClick={onClose}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 9999
      }}
    >
      <div
        className="bg-dark-section rounded-2xl p-6 md:p-8 max-w-lg w-full mx-auto my-8 border border-dark-bg shadow-2xl animate-fadeInScale"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxHeight: '90vh', 
          overflowY: 'auto',
          position: 'relative',
          zIndex: 10000
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-text-primary">Rate & Review</h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div>
            <label className="block text-text-primary font-medium mb-3">
              Your Rating <span className="text-accent">*</span>
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-all duration-200 hover:scale-125 active:scale-95"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-10 h-10 transition-all ${
                      star <= (hoverRating || rating)
                        ? 'fill-accent text-accent scale-110'
                        : 'text-text-secondary/40'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-text-secondary mt-2">
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good!' : rating === 2 ? 'Fair' : 'Poor'}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-text-primary font-medium mb-2">
              Your Name <span className="text-text-secondary text-sm font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-dark-bg border border-dark-section rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="Enter your name"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-text-primary font-medium mb-2">
              Your Comment <span className="text-text-secondary text-sm font-normal">(Optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-dark-bg border border-dark-section rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none transition-all"
              placeholder="Share your thoughts about this content..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full px-6 py-3 bg-accent text-dark-bg font-semibold rounded-lg hover:bg-accent/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Review</span>
              )}
            </button>
            {rating === 0 && (
              <p className="text-center text-xs text-text-secondary mt-2">
                Please select a rating to submit
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

