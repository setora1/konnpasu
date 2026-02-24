import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, Portal } from '../store';
import { SharedPortalSelector } from '../components/SharedPortalSelector';
import { ArrowLeft, Save, CheckCircle, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

export function MatchInput() {
  const { tournamentId, matchId } = useParams<{ tournamentId: string, matchId: string }>();
  const navigate = useNavigate();
  const { tournaments, updateMatch, currentUserRole } = useStore();

  useEffect(() => {
    if (tournamentId) {
      useStore.getState().joinRoom(tournamentId);
    }
  }, [tournamentId]);

  const tournament = tournamentId ? tournaments[tournamentId] : null;
  const match = tournament?.matches.find(m => m.id === matchId);

  const [teamBlueName, setTeamBlueName] = useState('');
  const [teamRedName, setTeamRedName] = useState('');
  const [portalOwners, setPortalOwners] = useState<Record<Portal, 'blue' | 'red' | null>>({
    A: null, B: null, C: null, D: null, E: null
  });
  const [blueKills, setBlueKills] = useState(0);
  const [redKills, setRedKills] = useState(0);

  useEffect(() => {
    if (match) {
      setTeamBlueName(match.teamBlue.name);
      setTeamRedName(match.teamRed.name);
      setBlueKills(match.teamBlue.kills);
      setRedKills(match.teamRed.kills);
      
      const newOwners: Record<Portal, 'blue' | 'red' | null> = { A: null, B: null, C: null, D: null, E: null };
      match.teamBlue.portals.forEach(p => newOwners[p] = 'blue');
      match.teamRed.portals.forEach(p => newOwners[p] = 'red');
      setPortalOwners(newOwners);
    }
  }, [match]);

  if (!tournament || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-bold text-slate-500">試合が見つかりません</div>
      </div>
    );
  }

  const handlePortalChange = (portal: Portal, owner: 'blue' | 'red' | null) => {
    setPortalOwners(prev => ({ ...prev, [portal]: owner }));
  };

  // Calculate scores
  const settings = tournament.settings;
  let blueScore = 0;
  let redScore = 0;
  let bluePortalsCount = 0;
  let redPortalsCount = 0;

  (Object.keys(portalOwners) as Portal[]).forEach(p => {
    if (portalOwners[p] === 'blue') {
      blueScore += settings.portalPoints[p];
      bluePortalsCount++;
    } else if (portalOwners[p] === 'red') {
      redScore += settings.portalPoints[p];
      redPortalsCount++;
    }
  });

  blueScore += blueKills * settings.killPoint;
  redScore += redKills * settings.killPoint;

  let winner: 'blue' | 'red' | null = null;
  if (bluePortalsCount === 5) {
    winner = 'blue';
  } else if (redPortalsCount === 5) {
    winner = 'red';
  } else if (bluePortalsCount > redPortalsCount) {
    winner = 'blue';
  } else if (redPortalsCount > bluePortalsCount) {
    winner = 'red';
  }

  if (winner === 'blue') {
    blueScore += settings.winBonus;
    redScore -= settings.lossPenalty;
  } else if (winner === 'red') {
    redScore += settings.winBonus;
    blueScore -= settings.lossPenalty;
  }

  const handleSave = (status: 'draft' | 'approved') => {
    const bluePortals = (Object.keys(portalOwners) as Portal[]).filter(p => portalOwners[p] === 'blue');
    const redPortals = (Object.keys(portalOwners) as Portal[]).filter(p => portalOwners[p] === 'red');

    updateMatch(tournament.id, match.id, {
      teamBlue: { name: teamBlueName, portals: bluePortals, kills: blueKills, score: blueScore },
      teamRed: { name: teamRedName, portals: redPortals, kills: redKills, score: redScore },
      winner,
      status
    });

    if (status === 'approved' && match.nextMatchId && winner) {
      const nextMatch = tournament.matches.find(m => m.id === match.nextMatchId);
      if (nextMatch) {
        const winnerName = winner === 'blue' ? teamBlueName : teamRedName;
        if (!nextMatch.teamBlue.name || nextMatch.teamBlue.name === match.teamBlue.name || nextMatch.teamBlue.name === match.teamRed.name) {
          updateMatch(tournament.id, nextMatch.id, { teamBlue: { ...nextMatch.teamBlue, name: winnerName } });
        } else {
          updateMatch(tournament.id, nextMatch.id, { teamRed: { ...nextMatch.teamRed, name: winnerName } });
        }
      }
    }

    if (currentUserRole === 'admin') {
      navigate(`/admin/${tournament.id}?tab=bracket`);
    } else {
      navigate(`/tournament/${tournament.id}`);
    }
  };

  const isReadOnly = !currentUserRole || currentUserRole === 'spectator' || (match.status === 'approved' && currentUserRole !== 'admin');

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b-2 border-slate-200 p-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-black text-xl text-slate-800 ml-2">
            第{match.round}回戦 - 第{match.matchNumber}試合
          </h1>
          {match.status === 'approved' && (
            <div className="ml-auto flex items-center space-x-1 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-bold">結果確定済</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8 space-y-8 animate-in fade-in duration-500">
        {/* Score Board */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8">
          {/* Blue Team */}
          <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-[0_8px_0_rgb(191,219,254)] p-4 sm:p-6 flex flex-col items-center">
            <div className="w-full mb-4">
              <input 
                type="text" 
                value={teamBlueName}
                onChange={(e) => setTeamBlueName(e.target.value)}
                placeholder="チーム青"
                disabled={isReadOnly}
                className="w-full text-center font-black text-xl sm:text-2xl text-blue-700 bg-transparent border-b-2 border-blue-100 focus:border-blue-500 focus:outline-none pb-2"
              />
            </div>
            <div className="text-5xl sm:text-7xl font-black text-blue-600 tracking-tighter my-4">
              {blueScore}
            </div>
            <div className="text-sm font-bold text-blue-400">合計スコア</div>
          </div>

          {/* Red Team */}
          <div className="bg-white rounded-3xl border-2 border-red-200 shadow-[0_8px_0_rgb(254,202,202)] p-4 sm:p-6 flex flex-col items-center">
            <div className="w-full mb-4">
              <input 
                type="text" 
                value={teamRedName}
                onChange={(e) => setTeamRedName(e.target.value)}
                placeholder="チーム赤"
                disabled={isReadOnly}
                className="w-full text-center font-black text-xl sm:text-2xl text-red-700 bg-transparent border-b-2 border-red-100 focus:border-red-500 focus:outline-none pb-2"
              />
            </div>
            <div className="text-5xl sm:text-7xl font-black text-red-600 tracking-tighter my-4">
              {redScore}
            </div>
            <div className="text-sm font-bold text-red-400">合計スコア</div>
          </div>
        </div>

        {/* Portal Map */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-black text-slate-800 mb-6 text-center">ポータル獲得状況</h2>
          <div className={cn("transition-opacity", isReadOnly && "opacity-70 pointer-events-none")}>
            <SharedPortalSelector portalOwners={portalOwners} onChange={handlePortalChange} />
          </div>
        </div>

        {/* Kills */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-black text-slate-800 mb-6 text-center">チーム合計キル数</h2>
          <div className="flex justify-between items-center max-w-md mx-auto gap-8">
            <div className="flex-1 space-y-2">
              <label className="block text-center font-bold text-blue-600">青チーム</label>
              <input 
                type="number" 
                min="0"
                value={blueKills}
                onChange={(e) => setBlueKills(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={isReadOnly}
                className="w-full text-center text-3xl font-black bg-blue-50 border-2 border-blue-200 rounded-2xl py-4 focus:border-blue-500 focus:ring-0 text-blue-700"
              />
            </div>
            <div className="text-2xl font-black text-slate-300">VS</div>
            <div className="flex-1 space-y-2">
              <label className="block text-center font-bold text-red-600">赤チーム</label>
              <input 
                type="number" 
                min="0"
                value={redKills}
                onChange={(e) => setRedKills(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={isReadOnly}
                className="w-full text-center text-3xl font-black bg-red-50 border-2 border-red-200 rounded-2xl py-4 focus:border-red-500 focus:ring-0 text-red-700"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Action Bar */}
      {!isReadOnly && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 p-4 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto flex justify-end space-x-4">
            {currentUserRole === 'player' && (
              <button 
                onClick={() => handleSave('draft')}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-amber-400 hover:bg-amber-500 text-white font-black px-8 py-4 rounded-2xl transition-colors shadow-[0_4px_0_rgb(217,119,6)] active:shadow-[0_0px_0_rgb(217,119,6)] active:translate-y-1"
              >
                <Save className="w-6 h-6" />
                <span>仮保存する</span>
              </button>
            )}
            {currentUserRole === 'admin' && (
              <>
                <button 
                  onClick={() => handleSave('draft')}
                  className="flex items-center justify-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black px-6 py-4 rounded-2xl transition-colors shadow-[0_4px_0_rgb(203,213,225)] active:shadow-[0_0px_0_rgb(203,213,225)] active:translate-y-1"
                >
                  <Save className="w-5 h-5" />
                  <span className="hidden sm:inline">仮保存</span>
                </button>
                <button 
                  onClick={() => handleSave('approved')}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl transition-colors shadow-[0_4px_0_rgb(5,150,105)] active:shadow-[0_0px_0_rgb(5,150,105)] active:translate-y-1"
                >
                  <ShieldAlert className="w-6 h-6" />
                  <span>結果を確定する</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
