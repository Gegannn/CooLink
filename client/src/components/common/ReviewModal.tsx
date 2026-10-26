import React, { useState } from 'react';
import { api } from '../../api/client';
import { Star, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  jobId: string;
  targetUserId: string;
  targetUserName: string;
  workRequestId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  jobId,
  targetUserId,
  targetUserName,
  workRequestId,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [punctuality, setPunctuality] = useState<number>(5);
  const [workQuality, setWorkQuality] = useState<number>(5);
  const [paymentPromptness, setPaymentPromptness] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/reviews', {
        jobId,
        targetUserId,
        workRequestId,
        rating,
        comment,
        categoryRatings: {
          punctuality,
          workQuality,
          paymentPromptness,
        },
      });

      onSuccess();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(
        axiosError.response?.data?.error?.message ||
          'Failed to submit review. Duplicate reviews are not permitted.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            Ratings & Reviews / റിവ്യൂ
          </p>
          <h2 className="text-lg font-bold">Rate {targetUserName}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your honest review builds trust across the community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Overall Star Selection */}
          <div className="text-center py-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Overall Experience
            </label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-600 mt-1">
              {rating === 5
                ? 'Excellent (വളരെ മികച്ചത്)'
                : rating === 4
                ? 'Good (നല്ലത്)'
                : rating === 3
                ? 'Average (ശരാശരി)'
                : 'Poor'}
            </p>
          </div>

          {/* Sub-ratings */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Punctuality (കൃത്യനിഷ്ഠ):</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setPunctuality(s)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= punctuality ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Work Quality (പണിയുടെ ഗുണം):</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setWorkQuality(s)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= workQuality ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Payment / Behaviour:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setPaymentPromptness(s)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= paymentPromptness ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Feedback & Comments (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Very skilled mason, finished the plastering ahead of schedule with clean finishing."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
