import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Clipboard } from 'lucide-react';

interface NumpadProps {
  code: string;
  setCode: (code: string) => void;
}

export function Numpad({ code, setCode }: NumpadProps) {
  const [showPasteModal, setShowPasteModal] = useState(false);

  const handlePress = (num: string) => {
    if (code.length < 6) {
      setCode(code + num);
    } else {
      setCode(code.slice(1) + num);
    }
  };

  const handleClear = () => {
    setCode('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const numbers = text.replace(/[^0-9]/g, '').slice(0, 6);
      if (numbers) {
        setCode(numbers);
      } else {
        setShowPasteModal(true);
      }
    } catch (err) {
      // Fallback for iframe environments where clipboard API might be blocked
      setShowPasteModal(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-sm mx-auto">
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full border-4 border-blue-400 flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-lg font-black text-slate-800 text-center">
              入力欄を長押しして<br/>大会IDを貼り付けてください
            </div>
            <input
              type="text"
              autoFocus
              className="w-full text-center text-2xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 focus:border-blue-500 focus:outline-none"
              placeholder="ここにペースト"
              onChange={(e) => {
                const text = e.target.value;
                const numbers = text.replace(/[^0-9]/g, '').slice(0, 6);
                if (numbers) {
                  setCode(numbers);
                }
                setShowPasteModal(false);
              }}
            />
            <button
              onClick={() => setShowPasteModal(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black px-6 py-3 rounded-xl transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-3">
          <div className="text-xl font-bold text-gray-700 tracking-widest">
            大会IDを入力
          </div>
          <button
            onClick={handlePaste}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors flex items-center space-x-1"
            title="貼り付け"
          >
            <Clipboard className="w-4 h-4" />
            <span className="text-xs font-bold">貼付</span>
          </button>
        </div>
        <div className="flex space-x-2 sm:space-x-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-10 h-12 sm:w-12 sm:h-14 border-b-4 flex items-center justify-center text-2xl sm:text-3xl font-black",
                code[i] ? "border-blue-500 text-blue-600" : "border-gray-300 text-transparent"
              )}
            >
              {code[i] || '0'}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full px-4 sm:px-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num.toString())}
            className="h-14 sm:h-16 bg-white border-2 border-gray-200 rounded-xl text-2xl font-black text-gray-800 shadow-[0_4px_0_rgb(229,231,235)] active:shadow-[0_0px_0_rgb(229,231,235)] active:translate-y-1 transition-all"
          >
            {num}
          </button>
        ))}
        <div className="col-span-2">
          <button
            onClick={handleClear}
            className="w-full h-14 sm:h-16 bg-gray-100 border-2 border-gray-200 rounded-xl flex items-center justify-center text-lg font-black text-gray-600 shadow-[0_4px_0_rgb(229,231,235)] active:shadow-[0_0px_0_rgb(229,231,235)] active:translate-y-1 transition-all"
          >
            IDクリア
          </button>
        </div>
        <div className="col-start-3">
          <button
            onClick={() => handlePress('0')}
            className="w-full h-14 sm:h-16 bg-white border-2 border-gray-200 rounded-xl text-2xl font-black text-gray-800 shadow-[0_4px_0_rgb(229,231,235)] active:shadow-[0_0px_0_rgb(229,231,235)] active:translate-y-1 transition-all"
          >
            0
          </button>
        </div>
      </div>
    </div>
  );
}
