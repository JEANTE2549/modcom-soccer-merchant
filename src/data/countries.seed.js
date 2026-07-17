// Placeholder roster generator for rehearsal builds.
// TODO: swap placeholder names for the real names/photos shown on the
// Canva player cards once those are exported and cataloged.

export const COUNTRIES = [
  "Spain",
  "France",
  "England",
  "Germany",
  "Portugal",
  "Argentina",
  "Brazil",
  "Japan",
  "USA",
  "Norway",
];

// Squad composition, fixed per country: FW 3, MF 3, DF 4, GK 1 (11 total)
const COMPOSITION = [
  { position: "GK", count: 1 },
  { position: "DF", count: 4 },
  { position: "MF", count: 3 },
  { position: "FW", count: 3 },
];

export function makeRoster(countryCode) {
  const players = [];
  for (const { position, count } of COMPOSITION) {
    for (let i = 1; i <= count; i++) {
      players.push({
        id: `${countryCode}-${position.toLowerCase()}-${i}`,
        name: `${position} ${i}`, // placeholder — replace with card-sourced name
        position,
        sold: false,
      });
    }
  }
  return players;
}

// { spain: [...11 players], france: [...], ... }
export function createInitialState() {
  const state = {};
  for (const country of COUNTRIES) {
    state[country.toLowerCase()] = makeRoster(country.toLowerCase());
  }
  return state;
}
