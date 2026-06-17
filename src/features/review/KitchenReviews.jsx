import { useState } from 'react';
import { Loader2, MessageSquare, Star, User } from 'lucide-react';
import toast from 'react-hot-toast';
import StarRating from '../../components/ui/StarRating.jsx';
import Button from '../../components/ui/Button.jsx';
import { useGetKitchenReviewsQuery, useCreateReviewMutation } from './reviewApi.js';

/**
 * Reviews section for KitchenDetailPage.
 * Shows review form (if user has a reviewable order) + paginated reviews list.
 */
export default function KitchenReviews({ kitchenId, reviewableOrderId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetKitchenReviewsQuery({
    kitchenId,
    page,
    limit: 5,
  });

  const reviews = data?.reviews || [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Review form */}
      {reviewableOrderId && (
        <ReviewForm orderId={reviewableOrderId} />
      )}

      {/* Reviews list */}
      <div className="mt-6">
        <h3 className="text-lg font-bold text-surface-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-500" />
          Reviews
          {pagination?.total > 0 && (
            <span className="text-sm font-normal text-surface-400">
              ({pagination.total})
            </span>
          )}
        </h3>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        )}

        {!isLoading && reviews.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 text-surface-300 mx-auto mb-2" />
            <p className="text-sm text-surface-500">No reviews yet</p>
          </div>
        )}

        {!isLoading && reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-surface-50 rounded-xl p-4 border border-surface-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {review.reviewer?.avatar ? (
                        <img
                          src={review.reviewer.avatar}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-primary-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-700">
                        {review.reviewer?.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-surface-400">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <StarRating value={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <p className="text-sm text-surface-600 mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  page === p
                    ? 'gradient-primary text-white'
                    : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Review form (inline).
 */
function ReviewForm({ orderId }) {
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-green-700">Thanks for your review!</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) return toast.error('Please select a rating');

    try {
      await createReview({ orderId, rating, comment: comment.trim() }).unwrap();
      setSubmitted(true);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-100 p-5">
      <h4 className="font-bold text-surface-800 mb-3">Rate your experience</h4>
      <StarRating value={rating} onChange={setRating} size="lg" />
      <textarea
        placeholder="Write a review (optional)"
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        className="w-full mt-3 px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none text-sm"
      />
      <div className="flex justify-end mt-3">
        <Button size="sm" onClick={handleSubmit} isLoading={isLoading}>
          Submit Review
        </Button>
      </div>
    </div>
  );
}
