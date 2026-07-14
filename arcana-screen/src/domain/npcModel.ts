import type { SocialNpc } from './focusModel';

// Tiny local tables for instant improv NPCs — one draw from each column.
const NAMES = ['Bram', 'Sella', 'Oront', 'Vesna', 'Corin', 'Marou', 'Ilta', 'Dregg', 'Yanna', 'Pell', 'Sorrel', 'Tavish'];
const ROLES = ['Innkeeper', 'Dockhand', 'Hedge witch', 'Fence', 'City guard', 'Scribe', 'Cutpurse', 'Herbalist', 'Bounty hunter', 'Beggar', 'Merchant', 'Acolyte'];
const MOTIVES = ['wants coin', 'wants protection', 'wants a debt repaid', 'wants information', 'wants to be left alone', 'wants revenge', 'wants to impress you', 'wants to flee the city'];
const SECRETS = ['is lying about their name', 'works for a rival', 'is hiding a fugitive', 'owes a dangerous debt', 'saw the murder', 'is not what they seem', 'betrayed you once before', 'carries something forbidden'];
const ATTITUDES: SocialNpc['attitude'][] = ['Guarded', 'Friendly', 'Neutral'];

const pick = <T>(list: T[], rng: () => number): T => list[Math.floor(rng() * list.length)];

// Returns the generated fields; the caller assigns a unique id when dropping it into a scene.
export const mintNpc = (rng: () => number = Math.random): Omit<SocialNpc, 'id'> => ({
  name: pick(NAMES, rng),
  role: pick(ROLES, rng),
  attitude: pick(ATTITUDES, rng),
  motive: pick(MOTIVES, rng),
  secret: pick(SECRETS, rng),
});
