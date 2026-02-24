import React from 'react';
import { Match, Tournament } from '../store';
import { cn } from '../lib/utils';

interface BracketProps {
  tournament: Tournament;
  onMatchClick?: (match: Match) => void;
}

function MatchNode({ match, tournament, onMatchClick }: { match: Match, tournament: Tournament, onMatchClick?: (match: Match) => void }) {
  const childMatches = tournament.matches
    .filter(m => m.nextMatchId === match.id)
    .sort((a, b) => a.matchNumber - b.matchNumber);

  const isChild0Winner = childMatches[0] && childMatches[0].winner !== null;
  const isChild1Winner = childMatches[1] && childMatches[1].winner !== null;

  return (
    <div className="flex flex-col items-center">
      {/* Match Card */}
      <div 
        onClick={() => onMatchClick && onMatchClick(match)}
        className={cn(
          "relative bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all w-40 sm:w-48 z-10",
          onMatchClick ? "cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-blue-300" : "border-slate-200"
        )}
      >
        <div className="text-center bg-slate-100 text-[10px] font-black text-slate-500 py-1 border-b-2 border-slate-200">
          {match.round === Math.max(...tournament.matches.map(m => m.round)) ? '決勝' : `第${match.round}回戦`}
        </div>
        {/* Blue Team */}
        <div className={cn(
          "flex justify-between items-center p-2 border-b-2",
          match.winner === 'blue' ? "bg-blue-50 border-blue-200" : "border-slate-100"
        )}>
          <span className={cn("font-bold truncate text-xs sm:text-sm", match.winner === 'blue' ? "text-blue-700" : "text-slate-700")}>
            {match.teamBlue.name || '未定'}
          </span>
          <span className={cn("font-black text-sm", match.winner === 'blue' ? "text-blue-600" : "text-slate-400")}>
            {match.teamBlue.score}
          </span>
        </div>
        {/* Red Team */}
        <div className={cn(
          "flex justify-between items-center p-2",
          match.winner === 'red' ? "bg-red-50" : ""
        )}>
          <span className={cn("font-bold truncate text-xs sm:text-sm", match.winner === 'red' ? "text-red-700" : "text-slate-700")}>
            {match.teamRed.name || '未定'}
          </span>
          <span className={cn("font-black text-sm", match.winner === 'red' ? "text-red-600" : "text-slate-400")}>
            {match.teamRed.score}
          </span>
        </div>
        
        {/* Status Badge */}
        {match.status === 'approved' && (
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg">
            確定
          </div>
        )}
        {match.status === 'draft' && (
          <div className="absolute top-0 right-0 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg">
            入力中
          </div>
        )}
      </div>

      {/* Children and connecting lines */}
      {childMatches.length === 2 && (
        <div className="flex flex-col items-center w-full">
          <div className={cn("w-1 h-6 sm:h-8", (isChild0Winner || isChild1Winner) ? "bg-yellow-400" : "bg-slate-800")} />
          
          <div className="flex w-full relative">
            <div className="absolute top-0 left-1/4 right-1/4 h-1 flex">
              <div className={cn("h-full w-1/2", isChild0Winner ? "bg-yellow-400" : "bg-slate-800")} />
              <div className={cn("h-full w-1/2", isChild1Winner ? "bg-yellow-400" : "bg-slate-800")} />
            </div>
            
            <div className="w-1/2 flex flex-col items-center">
              <div className={cn("w-1 h-6 sm:h-8", isChild0Winner ? "bg-yellow-400" : "bg-slate-800")} />
              <div className="px-1 sm:px-2 w-full flex justify-center">
                <MatchNode match={childMatches[0]} tournament={tournament} onMatchClick={onMatchClick} />
              </div>
            </div>
            
            <div className="w-1/2 flex flex-col items-center">
              <div className={cn("w-1 h-6 sm:h-8", isChild1Winner ? "bg-yellow-400" : "bg-slate-800")} />
              <div className="px-1 sm:px-2 w-full flex justify-center">
                <MatchNode match={childMatches[1]} tournament={tournament} onMatchClick={onMatchClick} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Bracket({ tournament, onMatchClick }: BracketProps) {
  if (!tournament.matches || tournament.matches.length === 0) {
    return null;
  }

  const finalMatch = tournament.matches.find(m => !m.nextMatchId);

  if (!finalMatch) return null;

  return (
    <div className="overflow-x-auto py-8 px-4 w-full bg-slate-50 rounded-2xl border-2 border-slate-200">
      <div className="min-w-max mx-auto flex justify-center">
        <MatchNode match={finalMatch} tournament={tournament} onMatchClick={onMatchClick} />
      </div>
    </div>
  );
}
