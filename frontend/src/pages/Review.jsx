import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { submitFeedback } from "../utils/api";

export default function Review() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setStatus({ type: "error", message: "Please sign in to submit a review." });
      return;
    }

    if (!comment.trim()) {
      setStatus({ type: "error", message: "Please share your thoughts with us." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await submitFeedback({ rating, comment });
      setStatus({ type: "success", message: "Thank You for your feedback!" });
      setComment("");
      setRating(5);
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 pt-6 pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Review our Website & Services
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Your feedback helps us improve the experience for everyone.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6">
        {!user ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bx bx-lock-alt text-3xl text-red-600"></i>
            </div>
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Only signed-in users can leave a review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How would you rate your experience?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform active:scale-90"
                  >
                    <i
                      className={`bx ${star <= rating ? "bxs-star text-yellow-400" : "bx-star text-gray-300"
                        } text-4xl`}
                    ></i>
                  </button>
                ))}
                <span className="ml-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {rating}/5
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share your feedback
              </label>
              <textarea
                rows={5}
                placeholder="What do you like or what can we improve?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3
                  bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none
                  focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                required
              />
            </div>

            {/* Status Message */}
            {status && (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium animate-in fade-in slide-in-from-top-2
                  ${status.type === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-800"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800"
                  }`}
              >
                {status.message}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white
                  font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <i className="bx bx-loader-alt bx-spin"></i> Submitting...
                  </span>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
