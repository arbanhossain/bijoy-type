import React from 'react';
import { UserProgress, KeyMap, CharacterStats } from '../types';
import * as ProgressService from '../services/progressService';

interface ProfilePageProps {
  userProgress: UserProgress;
  keymap: KeyMap;
  onBackToLobby: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userProgress, keymap, onBackToLobby }) => {
  const proficiencyThreshold = ProgressService.loadProficiencyThreshold();

  const calculateOverallProficiency = () => {
    const allStats = Object.values(userProgress.proficiencyStats);
    const practicedStats = allStats.filter((stats: CharacterStats) => stats.attempts > 0);

    const totalProficiencies = practicedStats.reduce((sum: number, stats: CharacterStats) => sum + stats.proficiency, 0);
    const masteredChars = practicedStats.filter((stats: CharacterStats) => stats.proficiency >= proficiencyThreshold).length;
    const totalPracticed = practicedStats.length;

    return {
      overall: totalPracticed > 0 ? (totalProficiencies / totalPracticed) * 100 : 0,
      masteredCount: masteredChars,
      totalPracticed: totalPracticed,
    };
  };

  const { overall, masteredCount, totalPracticed } = calculateOverallProficiency();

  const getProficiencyClass = (proficiency: number) => {
    if (proficiency >= 0.9) return 'bg-emerald-500';
    if (proficiency >= 0.7) return 'bg-yellow-500';
    if (proficiency >= 0.4) return 'bg-orange-500';
    return 'bg-rose-600';
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center bg-slate-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-sky-400 mb-6">আপনার প্রোফাইল</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        <div className="bg-slate-700 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-2">সামগ্রিক অগ্রগতি</h3>
          <p className="text-slate-300">গড় দক্ষতা: <span className="font-bold text-sky-300">{overall.toFixed(2)}%</span></p>
          <p className="text-slate-300">আয়ত্ত করা অক্ষর: <span className="font-bold text-emerald-300">{masteredCount}</span> / <span className="font-bold text-slate-300">{totalPracticed}</span></p>
          <p className="text-slate-300">আনলক করা কী: <span className="font-bold text-purple-300">{userProgress.unlockedKeys.length}</span></p>
        </div>
        <div className="bg-slate-700 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-2">সর্বশেষ আনলক করা কী</h3>
          <ul className="list-disc list-inside text-slate-300">
            {userProgress.unlockedKeys.slice(-5).map(key => (
              <li key={key}>{keymap[key]?.normal} ({key})</li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="text-2xl font-semibold text-white mb-4">অক্ষর দক্ষতা</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full overflow-y-auto max-h-96 p-2 custom-scrollbar">
        {Object.entries(userProgress.proficiencyStats)
          .sort(([charA], [charB]) => charA.localeCompare(charB))
          .map(([char, stats]: [string, CharacterStats]) => (
            <div key={char} className={`p-3 rounded-lg text-center ${getProficiencyClass(stats.proficiency)}`}>
              <p className="text-2xl font-bold text-white">{char === ' ' ? 'Space' : char}</p>
              <p className="text-sm text-slate-200">দক্ষতা: {(stats.proficiency * 100).toFixed(1)}%</p>
              <p className="text-xs text-slate-200">ভুল: {stats.errors}</p>
              <p className="text-xs text-slate-200">চেষ্টা: {stats.attempts}</p>
            </div>
          ))}
      </div>

      <button
        onClick={onBackToLobby}
        className="mt-8 px-8 py-3 bg-sky-600 text-white font-bold rounded-lg shadow-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
      >
        লবিতে ফিরে যান
      </button>
    </div>
  );
};

export default ProfilePage;
