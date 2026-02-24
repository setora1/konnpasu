import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore, Portal } from '../store';
import { Bracket } from '../components/Bracket';
import { Settings, Users, Copy, Check, Trophy, LogOut } from 'lucide-react';

export function AdminDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tournaments, updateSettings, updateTournament, generateBracket, logout } = useStore();
  const [copied, setCopied] = useState(false);
  
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'settings' | 'teams' | 'bracket'>(
    (tabParam as any) || 'settings'
  );
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    if (id) {
      useStore.getState().joinRoom(id);
    }
  }, [id]);

  const tournament = id ? tournaments[id] : null;

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-bold text-slate-500">大会が見つかりません</div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(tournament.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSettingChange = (key: string, value: number) => {
    updateSettings(tournament.id, {
      ...tournament.settings,
      [key]: value,
    });
  };

  const handlePortalChange = (portal: Portal, value: number) => {
    updateSettings(tournament.id, {
      ...tournament.settings,
      portalPoints: {
        ...tournament.settings.portalPoints,
        [portal]: value,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-slate-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="font-black text-xl text-slate-800">管理ダッシュボード</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-lg">
              <span className="text-sm font-bold text-slate-500">大会ID:</span>
              <span className="text-xl font-black tracking-widest text-blue-600">{tournament.id}</span>
              <button onClick={handleCopy} className="text-slate-400 hover:text-blue-500 transition-colors">
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm font-bold text-slate-500 hover:text-slate-700"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8 space-y-8">
        {/* Tabs */}
        <div className="flex space-x-4 border-b-2 border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-4 font-bold text-lg border-b-4 transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Settings className="inline-block w-5 h-5 mr-2" />
            スコア設定
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`pb-4 px-4 font-bold text-lg border-b-4 transition-colors whitespace-nowrap ${activeTab === 'teams' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Users className="inline-block w-5 h-5 mr-2" />
            参加チーム
          </button>
          <button
            onClick={() => setActiveTab('bracket')}
            className={`pb-4 px-4 font-bold text-lg border-b-4 transition-colors whitespace-nowrap ${activeTab === 'bracket' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Trophy className="inline-block w-5 h-5 mr-2" />
            トーナメント表
          </button>
        </div>

        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-slate-800 border-l-4 border-slate-500 pl-4">基本設定</h2>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-500">大会名</label>
                <input
                  type="text"
                  value={tournament.name}
                  onChange={(e) => updateTournament(tournament.id, { name: e.target.value })}
                  className="w-full text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 focus:border-slate-500 transition-colors"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-slate-800 border-l-4 border-blue-500 pl-4">ポータル別得点</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {(['A', 'B', 'C', 'D', 'E'] as Portal[]).map((p) => (
                  <div key={p} className="space-y-2">
                    <label className="block text-sm font-bold text-slate-500 text-center">ポータル {p}</label>
                    <input
                      type="number"
                      value={tournament.settings.portalPoints[p]}
                      onChange={(e) => handlePortalChange(p, Number(e.target.value))}
                      className="w-full text-center text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl py-3 focus:border-blue-500 focus:ring-0 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-slate-800 border-l-4 border-red-500 pl-4">キル・勝敗ボーナス</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-500">1キルあたりの加点</label>
                  <input
                    type="number"
                    value={tournament.settings.killPoint}
                    onChange={(e) => handleSettingChange('killPoint', Number(e.target.value))}
                    className="w-full text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-500">勝利ボーナス</label>
                  <input
                    type="number"
                    value={tournament.settings.winBonus}
                    onChange={(e) => handleSettingChange('winBonus', Number(e.target.value))}
                    className="w-full text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-500">敗北ペナルティ</label>
                  <input
                    type="number"
                    value={tournament.settings.lossPenalty}
                    onChange={(e) => handleSettingChange('lossPenalty', Number(e.target.value))}
                    className="w-full text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 border-l-4 border-emerald-500 pl-4">参加チーム設定</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      const newTeams = [...tournament.teams, `チーム${tournament.teams.length + 1}`];
                      updateTournament(tournament.id, { teams: newTeams });
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    チーム追加
                  </button>
                  <button 
                    onClick={() => {
                      if (tournament.teams.length > 2) {
                        const newTeams = tournament.teams.slice(0, -1);
                        updateTournament(tournament.id, { teams: newTeams });
                      }
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    チーム削除
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tournament.teams.map((team, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-bold text-slate-500">チーム {index + 1}</label>
                    <input
                      type="text"
                      value={team}
                      onChange={(e) => {
                        const newTeams = [...tournament.teams];
                        newTeams[index] = e.target.value;
                        updateTournament(tournament.id, { teams: newTeams });
                      }}
                      className="w-full text-lg font-black bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-4 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t-2 border-slate-100">
                {!showConfirm ? (
                  <button 
                    onClick={() => setShowConfirm(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-4 rounded-xl transition-colors shadow-[0_4px_0_rgb(5,150,105)] active:shadow-[0_0px_0_rgb(5,150,105)] active:translate-y-1"
                  >
                    トーナメント表を生成する
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        generateBracket(tournament.id, tournament.teams);
                        setActiveTab('bracket');
                        setShowConfirm(false);
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black px-6 py-4 rounded-xl transition-colors shadow-[0_4px_0_rgb(239,68,68)] active:shadow-[0_0px_0_rgb(239,68,68)] active:translate-y-1"
                    >
                      本当に生成する
                    </button>
                    <button 
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black px-6 py-4 rounded-xl transition-colors shadow-[0_4px_0_rgb(203,213,225)] active:shadow-[0_0px_0_rgb(203,213,225)] active:translate-y-1"
                    >
                      キャンセル
                    </button>
                  </div>
                )}
                <p className="text-center text-sm font-bold text-slate-400 mt-4">
                  ※チーム数や名前を変更した後は、必ず「トーナメント表を生成する」を押してください。
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bracket' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">進行状況</h2>
              {tournament.matches.length > 0 && (
                <button 
                  onClick={() => navigate(`/tournament/${tournament.id}`)}
                  className="bg-slate-800 text-white font-bold px-6 py-2 rounded-full hover:bg-slate-700 transition-colors shadow-sm"
                >
                  観戦画面を開く
                </button>
              )}
            </div>
            {tournament.matches.length > 0 ? (
              <>
                <Bracket 
                  tournament={tournament} 
                  onMatchClick={(match) => navigate(`/match/${tournament.id}/${match.id}`)} 
                />
                <p className="text-sm text-slate-500 font-bold text-center">
                  ※試合をタップすると、スコア詳細の確認・承認ができます。
                </p>
              </>
            ) : (
              <div className="bg-white p-12 rounded-2xl border-2 border-slate-200 text-center space-y-4 shadow-sm">
                <p className="text-slate-500 font-bold">トーナメント表がまだ生成されていません。</p>
                <button 
                  onClick={() => setActiveTab('teams')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-[0_4px_0_rgb(5,150,105)] active:shadow-[0_0px_0_rgb(5,150,105)] active:translate-y-1"
                >
                  参加チーム設定へ
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
