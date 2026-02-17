import OutletCard from "../components/OutletCard.jsx";
import HostelTopPicks from "../components/HostelTopPicks.jsx";
import BestRatedToday from "../components/BestRatedToday.jsx";
// TrendingModal temporarily disabled to avoid import resolution errors during dev
import { useMemo, useState, useEffect, useRef } from "react";
import { getOutletsForCampus } from "../data/campus.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCampus } from "../context/CampusContext.jsx";

export default function Home() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const { campuses, selectedCampus, selectCampusById, getOutlets } = useCampus();
  const campus = selectedCampus?.campusName || (campuses[0] && campuses[0].campusName);
  const [campusOpen, setCampusOpen] = useState(false);
  const campusRef = useRef(null);

  useEffect(() => {
    // persisted via CampusProvider; no-op here to keep behavior stable
  }, [campus]);

  useEffect(() => {
    function onDocClick(e) {
      if (!campusRef.current) return;
      if (!campusRef.current.contains(e.target)) setCampusOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Search across dishes (by name only) and derive matching outlets from those dishes
  const { outletResults, dishResults } = useMemo(() => {
  const query = q.trim().toLowerCase();
  const OUTLETS = getOutletsForCampus(campus);

  if (!query) {
    return { outletResults: OUTLETS, dishResults: [] };
  }


  const dishResults = OUTLETS.flatMap(o =>
    (o.menu || [])
      .filter(m =>
        m.name
          ?.toLowerCase()
          .split(" ")
          .some(word => word.startsWith(query))
      )
      .map(m => ({
        dish: m,
        outlet: { slug: o.slug, name: o.name, image: o.image },
      }))
  );


  const outletResults = OUTLETS.filter(o =>
    o.name?.toLowerCase().startsWith(query)
  );

  return { outletResults, dishResults };
}, [q, campus]);


  return (
    <section className="container-pad py-6 space-y-6 mx-auto max-w-7xl">
      <div className="card p-4 flex items-center gap-3">
        <div className="text-red-600 font-semibold relative" ref={campusRef}>
          <button
            onClick={() => setCampusOpen(v => !v)}
            className="flex items-center gap-1 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
            aria-haspopup="listbox"
            aria-expanded={campusOpen}
          >
            <span>Campus • {campus}</span>
            <svg className={`w-4 h-4 transition-transform ${campusOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.18l3.71-2.95a.75.75 0 111.04 1.08l-4.24 3.37a.75.75 0 01-.94 0L5.21 8.31a.75.75 0 01.02-1.1z" clipRule="evenodd" />
            </svg>
          </button>
          <div
            className={`absolute mt-2 z-20 w-40 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-900 shadow-lg transition transform origin-top-left ${campusOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}`}
          >
            {campuses.map((c) => (
              <button
                key={c.campusId}
                onClick={() => { selectCampusById(c.campusId); setCampusOpen(false); }}
                className={`w-full text-left px-3 py-2 transition ${campus===c.campusName ? 'bg-blue-600 text-white' : 'text-red-600 hover:bg-neutral-50 dark:hover:bg-gray-800'}`}
                role="option"
                aria-selected={campus===c.campusName}
              >
                {c.campusName}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search outlet or food…"
            className="w-full rounded-xl border border-neutral-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-700"
          />
        </div>
      </div>

      {!q.trim() && (
        <div className="space-y-8">
          <HostelTopPicks />
          <BestRatedToday />
        </div>
      )}

      {q.trim() && dishResults.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Dishes</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dishResults.map(({ dish, outlet }) => (
              <a
                key={`${outlet.slug}-${dish.id}`}
                href={`/outlet/${outlet.slug}`}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4 shadow hover:shadow-md transition"
              >
                <div className="w-20 h-20 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="p-2 text-sm">{dish.name}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{dish.name}</h3>
                    {dish.isVeg ? (
                      <span className="w-3.5 h-3.5 border-2 border-green-600 inline-block">
                        <span className="block w-full h-full bg-green-600"></span>
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 border-2 border-red-600 inline-block">
                        <span className="block w-full h-full bg-red-600"></span>
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{outlet.name}</div>
                  <div className="text-sm text-neutral-800 dark:text-neutral-200">₹{dish.price}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Outlets</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {outletResults.map((o) => (
            <OutletCard key={o.slug} outlet={o} />
          ))}
        </div>
      </div>
    </section>
  );
}
