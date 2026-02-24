import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Bracket } from '../components/Bracket';
import { Trophy, LogOut } from 'lucide-react';

export function TournamentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tournaments, currentUserRole, logout } = useStore();

  const tournament = id ? tournaments[id] : null;

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-bold text-slate-500">大会が見つかりません</div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b-2 border-slate-200 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-blue-600" />
            <h1 className="font-black text-xl text-slate-800">{tournament.name}</h1>
          </div>
          <div className="flex items-center space-x-4">
            {currentUserRole === 'admin' && (
              <button 
                onClick={() => navigate(`/admin/${tournament.id}`)}
                className="text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                管理画面へ
              </button>
            )}
            {currentUserRole ? (
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">退出</span>
              </button>
            ) : (
              <button 
                onClick={() => navigate('/')}
                className="text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                トップへ
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 py-8 space-y-8">
        <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-2">
            <h2 className="text-2xl font-black text-slate-800">トーナメント表</h2>
            {currentUserRole === 'player' && tournament.matches.length > 0 && (
              <p className="text-sm font-bold text-blue-600 animate-pulse">
                ※自分の試合をタップして結果を入力してください
              </p>
            )}
          </div>
          {tournament.matches.length > 0 ? (
            <Bracket 
              tournament={tournament} 
              onMatchClick={
                (currentUserRole === 'admin' || currentUserRole === 'player') 
                  ? (match) => navigate(`/match/${tournament.id}/${match.id}`) 
                  : undefined
              } 
            />
          ) : (
            <div className="py-12 text-center text-slate-500 font-bold">
              トーナメント表はまだ公開されていません。
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
