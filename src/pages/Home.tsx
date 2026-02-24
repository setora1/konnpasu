import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Match } from '../store';
import { Numpad } from '../components/Numpad';
import { Trophy, Settings, Eye, Swords } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const { login, createTournament } = useStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async (role: 'player' | 'spectator') => {
    if (code.length !== 6) {
      setError('6桁の大会IDを入力してください');
      return;
    }
    
    const success = await login(code, role);
    if (success) {
      navigate(`/tournament/${code}`);
    } else {
      setError('大会が見つかりませんでした');
    }
  };

  const handleCreate = () => {
    const defaultSettings = {
      portalPoints: { A: 10, B: 10, C: 20, D: 10, E: 10 },
      killPoint: 5,
      winBonus: 50,
      lossPenalty: 0,
    };
    
    const teams = ['チーム青', 'チーム赤', 'チーム白', 'チーム黒'];
    const id = createTournament('新規大会', defaultSettings, teams);
    navigate(`/admin/${id}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
      {/* Error Modal */}
      {error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full border-4 border-orange-400 flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-lg font-black text-slate-800 text-center">
              {error}
            </div>
            <button
              onClick={() => setError('')}
              className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 border-2 border-orange-400 font-black px-6 py-3 rounded-xl transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Trophy className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
            コンパス<br/>
            <span className="text-red-600">大会</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm">陣取りバトル大会集計ツール</p>
        </div>

        <Numpad code={code} setCode={setCode} />

        <div className="grid grid-cols-2 gap-4 px-4 sm:px-8">
          <button
            onClick={() => handleJoin('spectator')}
            className="flex flex-col items-center justify-center space-y-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black p-4 rounded-2xl transition-colors shadow-[0_4px_0_rgb(203,213,225)] active:shadow-[0_0px_0_rgb(203,213,225)] active:translate-y-1"
          >
            <Eye className="w-6 h-6" />
            <span>観戦で参加</span>
          </button>
          <button
            onClick={() => handleJoin('player')}
            className="flex flex-col items-center justify-center space-y-2 bg-blue-500 hover:bg-blue-600 text-white font-black p-4 rounded-2xl transition-colors shadow-[0_4px_0_rgb(37,99,235)] active:shadow-[0_0px_0_rgb(37,99,235)] active:translate-y-1"
          >
            <Swords className="w-6 h-6" />
            <span>大会に参加</span>
          </button>
        </div>

        <div className="pt-8 border-t-2 border-slate-100 flex flex-col items-center space-y-4">
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 font-bold transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>大会を新しく作成する (管理者)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
