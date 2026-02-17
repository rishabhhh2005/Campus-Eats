// src/data/campus.js
import { OUTLETS as OUTLETS_PUNJAB } from "./outlets.js";
import { OUTLETS_HIMACHAL } from "./outlets_himachal.js";

const CAMPUS_KEY = "ce_campus";

export function getCampus() {
  const v = (typeof localStorage !== "undefined" && localStorage.getItem(CAMPUS_KEY)) || "Punjab";
  return v === "Himachal" ? "Himachal" : "Punjab";
}

export function setCampus(campus) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(CAMPUS_KEY, campus === "Himachal" ? "Himachal" : "Punjab");
  }
}

export function getOutletsForCampus(campus) {
  return (campus === "Himachal" ? OUTLETS_HIMACHAL : OUTLETS_PUNJAB);
}

export function getAllOutlets() {
  return [...OUTLETS_PUNJAB, ...OUTLETS_HIMACHAL];
}


