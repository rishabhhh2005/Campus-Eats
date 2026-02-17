import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../utils/api.js";

export default function HostelTopPicks() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.hostel) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_URL}/recommendations/hostel/${user.hostel}`);
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching hostel recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.hostel || loading) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Most ordered by your hostel
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item) => (
          <div
            key={item._id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-md transition"
          >
            <div className="w-full h-32 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-700 mb-3">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="p-2 text-sm">{item.name}</div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-medium truncate">{item.name}</h3>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">₹{item.price}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-500">{item.count} orders</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
