import { useEffect, useReducer } from "react";
import { createInitialState, makeRoster } from "../data/countries.seed";
import { COUNTRY_META } from "../data/countryMeta";
import { buyPlayer, cancelPlayer } from "./pricing";
import { GOOGLE_APPS_SCRIPT_URL } from "../config";

export const STORAGE_KEY = "soccer-dashboard-state";

// Bump this whenever the persisted shape changes in a way old saves can't
// satisfy (e.g. required roster fields change, roster length changes).
// Adding a country to COUNTRY_META does NOT require a bump — isValidState
// already rejects saves missing a required country key and falls back to
// a fresh state on its own.
const STATE_VERSION = 1;

const REQUIRED_ROSTER_LENGTH = 11;

function isValidPlayer(player) {
  return (
    player !== null &&
    typeof player === "object" &&
    typeof player.id === "string" &&
    typeof player.position === "string" &&
    typeof player.sold === "boolean"
  );
}

function isValidRoster(roster) {
  return (
    Array.isArray(roster) &&
    roster.length === REQUIRED_ROSTER_LENGTH &&
    roster.every(isValidPlayer)
  );
}

// Validates the *unwrapped* per-country state object: every country in
// COUNTRY_META must be present with a well-formed 11-player roster. This is
// intentionally strict — any mismatch (missing country, wrong roster length,
// player missing required fields) is treated as corrupt/incompatible data.
function isValidState(candidate) {
  if (candidate === null || typeof candidate !== "object" || Array.isArray(candidate)) {
    return false;
  }
  return Object.keys(COUNTRY_META).every((code) => isValidRoster(candidate[code]));
}

// Saves written by this file (going forward) are wrapped as
// { version, data }. Saves that predate the version key (i.e. what's
// currently sitting in real users' localStorage today, unwrapped raw
// per-country state) are still accepted here as "legacy" and handed to
// isValidState as-is — that's what keeps today's in-progress sale data
// from being wiped out by this fix. Only *wrapped* saves whose version
// doesn't match STATE_VERSION are rejected outright.
function unwrapSaved(parsed) {
  if (
    parsed !== null &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    "version" in parsed &&
    "data" in parsed
  ) {
    if (parsed.version !== STATE_VERSION) return null;
    return parsed.data;
  }
  return parsed;
}

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const candidate = unwrapSaved(JSON.parse(saved));
      if (isValidState(candidate)) return candidate;
    }
  } catch {
    // malformed JSON / storage inaccessible — fall back to fresh state
  }
  return createInitialState();
}

function reducer(state, action) {
  if (action.type === "buy") {
    const { country, playerId } = action;
    return {
      ...state,
      [country]: buyPlayer(state[country], playerId),
    };
  }
  if (action.type === "cancel") {
    const { country, playerId } = action;
    return {
      ...state,
      [country]: cancelPlayer(state[country], playerId),
    };
  }
  if (action.type === "reset") {
    const { country } = action;
    return {
      ...state,
      [country]: makeRoster(country),
    };
  }
  if (action.type === "sync_sheet_data") {
    const newState = { ...state };
    let hasChanges = false;
    
    action.data.forEach(item => {
      // Find matching country code based on the label returned from Google Sheet
      const countryCode = Object.keys(COUNTRY_META).find(
        (key) => COUNTRY_META[key].label.toLowerCase() === (item.country || "").toLowerCase()
      );
      
      if (countryCode && newState[countryCode]) {
        const roster = newState[countryCode];
        const currentPlayers = parseInt(item.currentPlayers, 10);
        
        if (!isNaN(currentPlayers)) {
          // If currentPlayers is 8, 11 - 8 = 3 players are sold
          const soldCount = Math.max(0, REQUIRED_ROSTER_LENGTH - currentPlayers);
          
          let changedForCountry = false;
          const newRoster = roster.map((p, index) => {
            const shouldBeSold = index < soldCount;
            if (p.sold !== shouldBeSold) {
              changedForCountry = true;
              return { ...p, sold: shouldBeSold };
            }
            return p;
          });
          
          if (changedForCountry) {
            newState[countryCode] = newRoster;
            hasChanges = true;
          }
        }
      }
    });
    
    return hasChanges ? newState : state;
  }
  return state;
}

export function useSoccerDashboard() {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STATE_VERSION, data: state })
      );
    } catch {
      // storage unavailable/full — app keeps running without persistence
    }
  }, [state]);

  useEffect(() => {
    // Skip polling if no URL is provided yet
    if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.includes("YOUR_SCRIPT_ID")) return;

    let mounted = true;
    
    async function fetchData() {
      try {
        const res = await fetch(GOOGLE_APPS_SCRIPT_URL);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        if (mounted && Array.isArray(data)) {
          dispatch({ type: "sync_sheet_data", data });
        }
      } catch (err) {
        console.error("Error polling Google Sheet data:", err);
      }
    }

    // Initial fetch
    fetchData();
    
    // Poll every 3 seconds
    const interval = setInterval(fetchData, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  function buy(country, playerId) {
    dispatch({ type: "buy", country, playerId });
  }

  function cancel(country, playerId) {
    dispatch({ type: "cancel", country, playerId });
  }

  function reset(country) {
    dispatch({ type: "reset", country });
  }

  return { state, buy, cancel, reset };
}
