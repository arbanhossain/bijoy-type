
import React from 'react';
import { UserProgress, KeyDefinition, KeyMap } from '../types';

interface KeyboardProps {
  userProgress: UserProgress | null;
  keymap: KeyMap;
}

const Keyboard: React.FC<KeyboardProps> = ({ userProgress, keymap }) => {
  const getProficiencyClass = (keyCode: string) => {
    if (!userProgress) return 'bg-slate-700';

    if (!userProgress.unlockedKeys.includes(keyCode)) {
      return 'bg-slate-800 text-slate-600';
    }
    
    const keyDef: KeyDefinition | undefined = keymap[keyCode];
    if (!keyDef) return 'bg-slate-700';

    const chars = [keyDef.normal];
    if (keyDef.shift) chars.push(keyDef.shift);

    const proficiencies = chars
      .map(c => userProgress.proficiencyStats[c]?.proficiency)
      .filter(p => typeof p === 'number');

    if (proficiencies.length === 0) return 'bg-slate-600';

    const avgProficiency = proficiencies.reduce((a, b) => a + b, 0) / proficiencies.length;

    if (avgProficiency >= 0.9) return 'bg-emerald-500 hover:bg-emerald-400';
    if (avgProficiency >= 0.7) return 'bg-yellow-500 hover:bg-yellow-400';
    if (avgProficiency >= 0.4) return 'bg-orange-500 hover:bg-orange-400';
    return 'bg-rose-600 hover:bg-rose-500';
  };
  
  const keyboardLayout = [
    ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'],
    ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight'],
    ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote'],
    ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash']
  ];

  return (
    <div id="keyboard-display" className="p-4 bg-slate-800/50 rounded-lg space-y-2 mt-8 w-full max-w-4xl">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-2">
          {row.map(keyCode => {
            const keyDef = keymap[keyCode];
            if (!keyDef) return null;
            return (
              <div key={keyCode} className={`h-16 w-16 rounded-md flex flex-col items-center justify-center font-sans transition-colors duration-300 ${getProficiencyClass(keyCode)}`}>
                <span className="text-xl">{keyDef.normal}</span>
                {keyDef.shift && <span className="text-sm text-slate-200">{keyDef.shift}</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
