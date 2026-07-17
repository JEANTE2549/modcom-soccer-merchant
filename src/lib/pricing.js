// Pricing logic for the Soccer Dashboard.
// Rule (confirmed): every country starts all 11 cards at BASE_PRICE.
// Each sale raises the price of every remaining unsold card in that
// SAME country by STEP. Countries never affect each other.

export const BASE_PRICE = 200;
export const STEP = 200;

// roster: array of { id, position, sold }
export function currentPrice(roster) {
  const soldCount = roster.filter((p) => p.sold).length;
  return BASE_PRICE + STEP * soldCount;
}

export function remainingCount(roster) {
  return roster.filter((p) => !p.sold).length;
}

// Buys a single player by id. Returns a NEW roster array (immutable),
// or the same array unchanged if the player was already sold / not found.
export function buyPlayer(roster, playerId) {
  const target = roster.find((p) => p.id === playerId);
  if (!target || target.sold) return roster;
  return roster.map((p) => (p.id === playerId ? { ...p, sold: true } : p));
}

// Reverses a single sale by id (rollback). Returns a NEW roster array
// (immutable), or the same array unchanged if the player wasn't sold.
export function cancelPlayer(roster, playerId) {
  const target = roster.find((p) => p.id === playerId);
  if (!target || !target.sold) return roster;
  return roster.map((p) => (p.id === playerId ? { ...p, sold: false } : p));
}

// Vacuous-truth guard: Array.prototype.every on an empty (or malformed)
// roster would otherwise report "sold out", which would show a false
// SOLD OUT banner instead of surfacing the underlying data problem.
export function isCountrySoldOut(roster) {
  return Array.isArray(roster) && roster.length > 0 && roster.every((p) => p.sold);
}
