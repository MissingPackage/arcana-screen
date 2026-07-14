import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeLocalStorage } from '../utils/safeStorage';
import { createPartyMember, type PartyMember } from '../domain/partyModel';

interface PartyState {
  members: PartyMember[];
  addMember: (input?: Partial<PartyMember>) => string;
  updateMember: (id: string, updates: Partial<PartyMember>) => void;
  removeMember: (id: string) => void;
  reorderMember: (id: string, to: number) => void;
  setMembers: (members: Array<Partial<PartyMember>>) => void; // import / replace
  clearParty: () => void;
}

export const usePartyStore = create<PartyState>()(
  persist(
    (set, get) => ({
      members: [],

      addMember: (input) => {
        const member = createPartyMember(input);
        set((state) => ({ members: [...state.members, member] }));
        return member.id;
      },

      // Re-run createPartyMember so edited/HP values are always re-validated and clamped.
      updateMember: (id, updates) => set((state) => ({
        members: state.members.map((member) =>
          member.id === id ? createPartyMember({ ...member, ...updates, id: member.id }) : member),
      })),

      removeMember: (id) => set((state) => ({
        members: state.members.filter((member) => member.id !== id),
      })),

      reorderMember: (id, to) => {
        const members = [...get().members];
        const from = members.findIndex((member) => member.id === id);
        if (from < 0 || to < 0 || to >= members.length || to === from) return;
        const [moved] = members.splice(from, 1);
        members.splice(to, 0, moved);
        set({ members });
      },

      setMembers: (members) => set({ members: members.map((member) => createPartyMember(member)) }),

      clearParty: () => set({ members: [] }),
    }),
    {
      name: 'arcana_party',
      storage: createJSONStorage(() => safeLocalStorage),
      version: 1,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<PartyState>;
        return {
          ...state,
          members: Array.isArray(state.members)
            ? state.members.map((member) => createPartyMember(member as Partial<PartyMember>))
            : [],
        } as PartyState;
      },
    },
  ),
);
