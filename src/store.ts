import { create } from 'zustand';
import { io } from 'socket.io-client';

export const socket = io();

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
  login: (code: string, role: Role) => Promise<boolean>;
  logout: () => void;
  joinRoom: (id: string) => void;
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

export const useStore = create<AppState>((set, get) => {
  socket.on('tournament_state', (tournament: Tournament) => {
    set((state) => ({
      tournaments: {
        ...state.tournaments,
        [tournament.id]: tournament
      }
    }));
  });

  return {
    tournaments: {},
    currentUserRole: null,
    currentTournamentId: null,

    joinRoom: (id) => {
      socket.emit('join_tournament', id);
    },

    createTournament: (name, settings, teams) => {
      let id = generateId();
      // In a real app, we'd check server-side for collision, but this is okay for prototype
      const matches: Match[] = [];
      const tournament: Tournament = { id, name, settings, teams, matches };
      
      socket.emit('create_tournament', tournament);
      socket.emit('join_tournament', id);

      set((state) => ({
        tournaments: {
          ...state.tournaments,
          [id]: tournament,
        },
        currentUserRole: 'admin',
        currentTournamentId: id,
      }));
      return id;
    },

    updateSettings: (id, settings) => {
      set((state) => {
        const t = state.tournaments[id];
        if (!t) return state;
        const updated = { ...t, settings };
        socket.emit('update_tournament', id, updated);
        return {
          tournaments: { ...state.tournaments, [id]: updated },
        };
      });
    },

    updateTournament: (id, updates) => {
      set((state) => {
        const t = state.tournaments[id];
        if (!t) return state;
        const updated = { ...t, ...updates };
        socket.emit('update_tournament', id, updated);
        return {
          tournaments: { ...state.tournaments, [id]: updated },
        };
      });
    },

    updateMatch: (tournamentId, matchId, updates) => {
      set((state) => {
        const tournament = state.tournaments[tournamentId];
        if (!tournament) return state;

        const updatedMatches = tournament.matches.map((m) =>
          m.id === matchId ? { ...m, ...updates } : m
        );
        const updated = { ...tournament, matches: updatedMatches };
        socket.emit('update_tournament', tournamentId, updated);

        return {
          tournaments: { ...state.tournaments, [tournamentId]: updated },
        };
      });
    },

    generateBracket: (tournamentId, teams) => {
      set((state) => {
        const tournament = state.tournaments[tournamentId];
        if (!tournament) return state;
        
        const matches = createBracketMatches(teams);
        const updated = { ...tournament, teams, matches };
        socket.emit('update_tournament', tournamentId, updated);

        return {
          tournaments: { ...state.tournaments, [tournamentId]: updated },
        };
      });
    },

    login: async (code, role) => {
      return new Promise((resolve) => {
        socket.emit('check_tournament', code, (exists: boolean) => {
          if (exists || role === 'admin') {
            set({ currentTournamentId: code, currentUserRole: role });
            socket.emit('join_tournament', code);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    },

    logout: () => {
      const { currentTournamentId } = get();
      if (currentTournamentId) {
        socket.emit('leave_tournament', currentTournamentId);
      }
      set({ currentTournamentId: null, currentUserRole: null });
    },
  };
});
