import type { SocialNpc } from './focusModel';

// Tiny local tables for instant improv NPCs — one draw from each column.
const NAMES = ['Bram', 'Sella', 'Oront', 'Vesna', 'Corin', 'Marou', 'Ilta', 'Dregg', 'Yanna', 'Pell', 'Sorrel', 'Tavish', 'Wren', 'Halla', 'Fenn', 'Ordo', 'Mire', 'Cass', 'Bryn', 'Locke', 'Thessa', 'Rook'];
const ROLES = ['Innkeeper', 'Dockhand', 'Hedge witch', 'Fence', 'City guard', 'Scribe', 'Cutpurse', 'Herbalist', 'Bounty hunter', 'Beggar', 'Merchant', 'Acolyte', 'Bartender', 'Blacksmith', 'Sailor', 'Courier', 'Gravedigger', 'Moneylender', 'Street preacher', 'Ratcatcher'];
const MOTIVES = ['wants coin', 'wants protection', 'wants a debt repaid', 'wants information', 'wants to be left alone', 'wants revenge', 'wants to impress you', 'wants to flee the city', 'wants a favour returned', 'wants someone found'];
const SECRETS = ['is lying about their name', 'works for a rival', 'is hiding a fugitive', 'owes a dangerous debt', 'saw the murder', 'is not what they seem', 'betrayed you once before', 'carries something forbidden', 'is being blackmailed', 'knows the way in'];
const ATTITUDES: SocialNpc['attitude'][] = ['Guarded', 'Friendly', 'Neutral'];

const pick = <T>(list: T[], rng: () => number): T => list[Math.floor(rng() * list.length)];

// Returns the generated fields; the caller assigns a unique id when dropping it into a scene.
// A `role` pins the NPC to what the player already asked for ("the bartender") instead of a random draw.
export const mintNpc = (role?: string, rng: () => number = Math.random): Omit<SocialNpc, 'id'> => ({
  name: pick(NAMES, rng),
  role: role?.trim() || pick(ROLES, rng),
  attitude: pick(ATTITUDES, rng),
  motive: pick(MOTIVES, rng),
  secret: pick(SECRETS, rng),
});
