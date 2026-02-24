import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'admin' | 'player' | 'spectator' | null;
export type Portal = 'A' | 'B' | 'C' | 'D' | 'E';

export interface TournamentSettings {
  portalPoints: Record<Portal, number>;
  killPoint: number;
  winBonus: number;
  lossPenalty: number;
}

export interface TeamResult {
  name: string;
  portals: Portal[];
  kills: number;
  score: number;
}

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  teamBlue: TeamResult;
  teamRed: TeamResult;
  winner: 'blue' | 'red' | null;
  status: 'pending' | 'draft' | 'approved';
  nextMatchId?: string;
}

export interface Tournament {
  id: string; // 6-digit code
  name: string;
  settings: TournamentSettings;
  teams: string[];
  matches: Match[];
}

interface AppState {
  tournaments: Record<string, Tournament>;
  currentUserRole: Role;
  currentTournamentId: string | null;
  createTournament: (name: string, settings: TournamentSettings, teams: string[]) => string;
  updateSettings: (id: string, settings: TournamentSettings) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  updateMatch: (tournamentId: string, matchId: string, updates: Partial<Match>) => void;
  generateBracket: (tournamentId: string, teams: string[]) => void;
  login: (code: string, role: Role) => boolean;
  logout: () => void;
}

const generateId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createBracketMatches = (teams: string[]): Match[] => {
  const matches: Match[] = [];
  const numTeams = Math.max(2, teams.length);
  const numRounds = Math.ceil(Math.log2(numTeams));
  const totalSlots = Math.pow(2, numRounds);

  const paddedTeams = [...teams];
  while (paddedTeams.length < totalSlots) {
    paddedTeams.push('');
  }

  let matchIdCounter = 1;
  const uniquePrefix = Math.random().toString(36).substring(2, 8);
  let previousRoundMatches: Match[] = [];
  
  for (let round = 1; round <= numRounds; round++) {
    const roundMatches: Match[] = [];
    const numMatchesInRound = totalSlots / Math.pow(2, round);
    
    for (let i = 0; i < numMatchesInRound; i++) {
      const matchId = `m_${uniquePrefix}_${matchIdCounter++}`;
      const match: Match = {
        id: matchId,
        round,
        matchNumber: i + 1,
        teamBlue: { name: '', portals: [], kills: 0, score: 0 },
        teamRed: { name: '', portals: [], kills: 0, score: 0 },
        winner: null,
        status: 'pending',
      };
      
      if (round === 1) {
        match.teamBlue.name = paddedTeams[i * 2] || '';
        match.teamRed.name = paddedTeams[i * 2 + 1] || '';
      }
      
      roundMatches.push(match);
      matches.push(match);
    }
    
    if (round > 1) {
      for (let i = 0; i < previousRoundMatches.length; i++) {
        previousRoundMatches[i].nextMatchId = roundMatches[Math.floor(i / 2)].id;
      }
    }
    
    previousRoundMatches = roundMatches;
  }
  
  return matches;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tournaments: {},
      currentUserRole: null,
      currentTournamentId: null,

      createTournament: (name, settings, teams) => {
        let id = generateId();
        while (get().tournaments[id]) {
          id = generateId();
        }
        const matches: Match[] = [];
        set((state) => ({
          tournaments: {
            ...state.tournaments,
            [id]: { id, name, settings, teams, matches },
          },
          currentUserRole: 'admin',
          currentTournamentId: id,
        }));
        return id;
      },

      updateSettings: (id, settings) => {
        set((state) => ({
          tournaments: {
            ...state.tournaments,
            [id]: { ...state.tournaments[id], settings },
          },
        }));
      },

      updateTournament: (id, updates) => {
        set((state) => ({
          tournaments: {
            ...state.tournaments,
            [id]: { ...state.tournaments[id], ...updates },
          },
        }));
      },

      updateMatch: (tournamentId, matchId, updates) => {
        set((state) => {
          const tournament = state.tournaments[tournamentId];
          if (!tournament) return state;

          const updatedMatches = tournament.matches.map((m) =>
            m.id === matchId ? { ...m, ...updates } : m
          );

          return {
            tournaments: {
              ...state.tournaments,
              [tournamentId]: { ...tournament, matches: updatedMatches },
            },
          };
        });
      },

      generateBracket: (tournamentId, teams) => {
        set((state) => {
          const tournament = state.tournaments[tournamentId];
          if (!tournament) return state;
          
          const matches = createBracketMatches(teams);
          return {
            tournaments: {
              ...state.tournaments,
              [tournamentId]: { ...tournament, teams, matches },
            },
          };
        });
      },

      login: (code, role) => {
        const tournament = get().tournaments[code];
        if (tournament || role === 'admin') {
          set({ currentTournamentId: code, currentUserRole: role });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentTournamentId: null, currentUserRole: null });
      },
    }),
    {
      name: 'compass-tournament-storage',
    }
  )
);
