import React, { createContext, useContext, useEffect, useState } from "react";
import { CAMPUSES, getCampusBySourceKey, getCampusById } from "../data/campuses.js";
import { getCampus as legacyGetCampus, setCampus as legacySetCampus, getOutletsForCampus } from "../data/campus.js";

const CampusContext = createContext(null);

export function CampusProvider({ children }) {
  // Initialize from legacy localStorage (returns 'Punjab' or 'Himachal')
  const initialLegacy = legacyGetCampus();
  const initial = getCampusBySourceKey(initialLegacy) || CAMPUSES[0];

  const [campuses, setCampuses] = useState(CAMPUSES);
  const [selectedCampus, setSelectedCampus] = useState(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Persist using the legacy setter so other code (that uses campus.js) keeps working
    if (selectedCampus && selectedCampus.sourceKey) {
      legacySetCampus(selectedCampus.sourceKey);
    }
  }, [selectedCampus]);

  useEffect(() => {
    // Try to fetch campuses from backend, fall back to static CAMPUSES
    let mounted = true;
    async function fetchCampuses() {
      setLoading(true);
      try {
        const res = await fetch('/api/campuses');
        if (!res.ok) throw new Error('Network response not ok');
        const data = await res.json();
        if (mounted && Array.isArray(data.campuses) && data.campuses.length > 0) {
          setCampuses(data.campuses);
          // If current selectedCampus isn't in fetched list, map by sourceKey/id
          const found = data.campuses.find(c => c.sourceKey === selectedCampus?.sourceKey || c.campusId === selectedCampus?.campusId);
          if (found) setSelectedCampus(found);
        }
      } catch (err) {
        // ignore — keep static CAMPUSES
        // console.warn('Could not fetch campuses, using static list', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchCampuses();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectCampusById(campusId) {
    const c = getCampusById(campusId) || campuses.find(c => c.campusId === campusId);
    if (c) setSelectedCampus(c);
  }

  function getOutlets() {
    // For now reuse existing helper for derived outlet data (legacy static outlets)
    return getOutletsForCampus(selectedCampus.sourceKey);
  }

  return (
    <CampusContext.Provider value={{ campuses, selectedCampus, selectCampusById, getOutlets, loading }}>
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error("useCampus must be used within CampusProvider");
  return ctx;
}
