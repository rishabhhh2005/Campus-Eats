// src/data/campuses.js
import { OUTLETS as OUTLETS_PUNJAB } from "./outlets.js";
import { OUTLETS_HIMACHAL } from "./outlets_himachal.js";

// Universal Campus model (minimal, ready for backend integration)
export const CAMPUSES = [
  {
    campusId: "punjab",
    campusName: "Punjab",
    universityName: "Chitkara University",
    city: "Punjab",
    state: "Punjab",
    logo: null,
    theme: {},
    // sourceKey kept for backward compatibility with existing helper functions
    sourceKey: "Punjab",
    outlets: OUTLETS_PUNJAB,
  },
  {
    campusId: "himachal",
    campusName: "Himachal",
    universityName: "Himachal University",
    city: "Himachal",
    state: "Himachal Pradesh",
    logo: null,
    theme: {},
    sourceKey: "Himachal",
    outlets: OUTLETS_HIMACHAL,
  },
];

export function getCampusById(id) {
  return CAMPUSES.find((c) => c.campusId === id) || CAMPUSES[0];
}

export function getCampusBySourceKey(key) {
  return CAMPUSES.find((c) => c.sourceKey === key) || CAMPUSES[0];
}
