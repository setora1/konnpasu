import React from 'react';
import { cn } from '../lib/utils';
import { Portal } from '../store';

interface SharedPortalSelectorProps {
  portalOwners: Record<Portal, 'blue' | 'red' | null>;
  onChange: (portal: Portal, owner: 'blue' | 'red' | null) => void;
}

export function SharedPortalSelector({ portalOwners, onChange }: SharedPortalSelectorProps) {
  const cycleOwner = (p: Portal) => {
    const current = portalOwners[p];
    if (current === null) onChange(p, 'blue');
    else if (current === 'blue') onChange(p, 'red');
    else onChange(p, null);
  };

  const getPortalClass = (p: Portal) => {
    const owner = portalOwners[p];
    const base = "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-2xl border-4 transition-all shadow-md cursor-pointer select-none";
    
    if (owner === 'blue') {
      return cn(base, "bg-blue-500 border-blue-700 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110");
    } else if (owner === 'red') {
      return cn(base, "bg-red-500 border-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-110");
    } else {
      return cn(base, "bg-gray-100 border-gray-300 text-gray-400 hover:border-gray-400");
    }
  };

  const blueCount = Object.values(portalOwners).filter(o => o === 'blue').length;
  const redCount = Object.values(portalOwners).filter(o => o === 'red').length;

  return (
    <div className="relative w-full max-w-[320px] aspect-[4/5] mx-auto bg-slate-50 rounded-3xl border-2 border-slate-200 p-4 overflow-hidden">
      {/* Background grid/lines to look like a map */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Scoreboard */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-white px-5 py-1.5 rounded-full border-2 border-slate-200 shadow-sm z-20">
        <div className="text-xl font-black text-blue-600">{blueCount}</div>
        <div className="text-slate-300 font-black">-</div>
        <div className="text-xl font-black text-red-600">{redCount}</div>
      </div>

      {/* Red Team Area Indicator */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-red-100 text-red-600 font-black text-xs rounded-full border-2 border-red-200 whitespace-nowrap">赤チーム</div>
      
      {/* Blue Team Area Indicator */}
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-blue-100 text-blue-600 font-black text-xs rounded-full border-2 border-blue-200 whitespace-nowrap">青チーム</div>

      <div className="absolute inset-0 flex flex-col items-center justify-center mt-6">
        {/* D, E Row */}
        <div className="flex justify-between w-40 mb-6 relative z-10">
          <div onClick={() => cycleOwner('D')} className={getPortalClass('D')}>D</div>
          <div onClick={() => cycleOwner('E')} className={getPortalClass('E')}>E</div>
        </div>
        
        {/* C Row */}
        <div className="flex justify-center w-full mb-6 relative z-10">
          <div onClick={() => cycleOwner('C')} className={getPortalClass('C')}>C</div>
        </div>

        {/* A, B Row */}
        <div className="flex justify-between w-40 relative z-10">
          <div onClick={() => cycleOwner('A')} className={getPortalClass('A')}>A</div>
          <div onClick={() => cycleOwner('B')} className={getPortalClass('B')}>B</div>
        </div>
      </div>
      
      <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 font-bold">
        タップで色変更
      </div>
    </div>
  );
}
