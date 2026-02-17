import { useState, useEffect } from "react";
import { API_URL } from "../utils/api.js";

export default function BestRatedToday() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_URL}/recommendations/best-rated-today`);
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching best rated today:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Best rated today
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item) => (
          <div
            key={item._id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-md transition"
          >
            <div className="min-w-0">
              <h3 className="font-medium truncate">{item.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {item.avgRating.toFixed(1)} ({item.count} ratings)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
