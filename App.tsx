
import React, { useState, useEffect, useCallback } from 'react';
import { UserProgress, GameState, CharacterStats } from './types';
import * as ProgressService from './services/progressService';
import * as LessonService from './services/lessonService';
import TypingArea from './components/TypingArea';
import Keyboard from './components/Keyboard';
import Controls from './components/Controls';
import { keymap, unlockOrder } from './constants';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';

const App: React.FC = () => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [masterVocabulary, setMasterVocabulary] = useState<string[]>([]);
  const [lessonText, setLessonText] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [lastUnlocked, setLastUnlocked] = useState<string | null>(null);
  const [liveStats, setLiveStats] = useState({ wpm: 0, accuracy: 100 });
  const [proficiencyThreshold, setProficiencyThreshold] = useState(0.9); // Default value from constants
  const [useAllUnlockedKeys, setUseAllUnlockedKeys] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false); // New state for typing status

  const handleViewProfile = () => {
    setGameState(GameState.PROFILE);
  };

  const handleBackToLobby = () => {
    setGameState(GameState.LOBBY);
  };

  const handleViewSettings = () => {
    setGameState(GameState.SETTINGS);
  };

  useEffect(() => {
    const loadedProgress = ProgressService.loadProgress();
    setUserProgress(loadedProgress);
    const vocab = ProgressService.loadVocabulary();
    if (vocab) {
      setMasterVocabulary(vocab);
    }
    setProficiencyThreshold(ProgressService.loadProficiencyThreshold());
    setUseAllUnlockedKeys(ProgressService.loadUseAllUnlockedKeys());
  }, []);

  const handleVocabUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const words = text.split(/\s+/).filter(word => word.length > 0);
        setMasterVocabulary(words);
        ProgressService.saveVocabulary(words);
        setGameState(GameState.LOBBY); // Go back to lobby to start a new lesson
      };
      reader.readAsText(file);
    }
  };

  const handleResetProgress = () => {
    const newProgress = ProgressService.resetProgress();
    setUserProgress(newProgress);
    setGameState(GameState.LOBBY);
    setLastUnlocked(null);
  };

  const startLesson = () => {
    if (!userProgress || masterVocabulary.length === 0) return;
    const text = LessonService.generatePracticeText(userProgress, masterVocabulary);
    setLessonText(text);
    setGameState(GameState.TYPING);
    setLastUnlocked(null);
    setHasStartedTyping(true); // Set to true when lesson starts
  };

  const resetLesson = () => {
    setGameState(GameState.LOBBY);
    setHasStartedTyping(false); // Reset typing status
  };
  
  const recalculateProficiency = useCallback((progress: UserProgress, lessonStats: { [char: string]: Omit<CharacterStats, 'proficiency'> }): UserProgress => {
      const newProgress = JSON.parse(JSON.stringify(progress));
      Object.keys(lessonStats).forEach(char => {
          const stats = lessonStats[char];
          const oldStats = newProgress.proficiencyStats[char];
          
          oldStats.attempts += stats.attempts;
          oldStats.errors += stats.errors;
          oldStats.latency.push(...stats.latency);
          // Keep last 20 latencies for stable average
          oldStats.latency = oldStats.latency.slice(-20);

          const errorRate = oldStats.attempts > 0 ? oldStats.errors / oldStats.attempts : 0;
          
          let normalizedSpeedScore = 0;
          if (oldStats.latency.length > 0) {
              const avgLatency = oldStats.latency.reduce((a, b) => a + b, 0) / oldStats.latency.length;
              // Target latency: 150ms. Score is 1. Score degrades up to 650ms.
              normalizedSpeedScore = Math.max(0, 1 - (avgLatency - 150) / 500);
          }
          
          oldStats.proficiency = (1 - errorRate) * normalizedSpeedScore;
      });
      return newProgress;
  }, []);

  const checkForUnlocks = useCallback((progress: UserProgress, currentProficiencyThreshold: number): UserProgress => {
      const newProgress = JSON.parse(JSON.stringify(progress));
      const lastUnlockedKey = newProgress.unlockedKeys[newProgress.unlockedKeys.length - 1];
      const keyDef = keymap[lastUnlockedKey];
      if (!keyDef) return newProgress;

      const charsToMaster = [keyDef.normal];
      if(keyDef.shift) charsToMaster.push(keyDef.shift);

      const allMastered = charsToMaster.every(c => (newProgress.proficiencyStats[c]?.proficiency || 0) >= currentProficiencyThreshold);

      if (allMastered) {
          const nextKeyIndex = unlockOrder.findIndex(k => k === lastUnlockedKey) + 1;
          if (nextKeyIndex > 0 && nextKeyIndex < unlockOrder.length) {
              const nextKeyToUnlock = unlockOrder[nextKeyIndex];
              if (!newProgress.unlockedKeys.includes(nextKeyToUnlock)) {
                  newProgress.unlockedKeys.push(nextKeyToUnlock);
                  const newKeyDef = keymap[nextKeyToUnlock];
                  setLastUnlocked(newKeyDef.normal);
              }
          }
      }
      return newProgress;
  }, []);

  const handleLessonComplete = useCallback((lessonStats: { [char: string]: Omit<CharacterStats, 'proficiency'> }) => {
    if (!userProgress) return;

    let updatedProgress = recalculateProficiency(userProgress, lessonStats);
    updatedProgress = checkForUnlocks(updatedProgress, proficiencyThreshold);

    ProgressService.saveProgress(updatedProgress);
    setUserProgress(updatedProgress);
    setGameState(GameState.FINISHED);
    setHasStartedTyping(false); // Set to false when lesson completes
  }, [userProgress, recalculateProficiency, checkForUnlocks, proficiencyThreshold]);

  const handleUpdateProficiencyThreshold = useCallback((threshold: number) => {
    const newThreshold = threshold / 100; // Convert 0-100 to 0-1
    setProficiencyThreshold(newThreshold);
    ProgressService.saveProficiencyThreshold(newThreshold);
  }, []);

  const handleToggleKeyLock = useCallback((key: string) => {
    if (!userProgress) return;

    const newUnlockedKeys = userProgress.unlockedKeys.includes(key)
      ? userProgress.unlockedKeys.filter(k => k !== key)
      : [...userProgress.unlockedKeys, key].sort((a, b) => unlockOrder.indexOf(a) - unlockOrder.indexOf(b)); // Maintain order

    const updatedProgress = { ...userProgress, unlockedKeys: newUnlockedKeys };
    ProgressService.saveProgress(updatedProgress);
    setUserProgress(updatedProgress);
  }, [userProgress]);

  const handleToggleUseAllUnlockedKeys = useCallback((useAll: boolean) => {
    setUseAllUnlockedKeys(useAll);
    ProgressService.saveUseAllUnlockedKeys(useAll);
  }, []);

  if (!userProgress) {
    return <div className="flex items-center justify-center min-h-screen">লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-sky-400">JatiyaTyper</h1>
        <p className="text-slate-400 mt-2">আপনার বাংলা টাইপিং দক্ষতা বৃদ্ধি করুন</p>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center">
        {gameState === GameState.LOBBY && (
          <div className="text-center bg-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-white">অনুশীলন শুরু করুন</h2>
            {masterVocabulary.length === 0 ? (
              <p className="text-yellow-400">অনুশীলন শুরু করার জন্য অনুগ্রহ করে একটি শব্দভান্ডার (.txt) ফাইল আপলোড করুন।</p>
            ) : (
              <>
                <p className="mb-6 text-slate-300">প্রস্তুত হলে নিচের বাটনে ক্লিক করুন।</p>
                <button
                  onClick={startLesson}
                  className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-lg hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                  পাঠ শুরু করুন
                </button>
              </>
            )}
            {!hasStartedTyping && ( // Conditionally render based on hasStartedTyping
              <>
                <button
                  onClick={handleViewProfile}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors duration-200"
                >
                  প্রোফাইল দেখুন
                </button>
                <button
                  onClick={handleViewSettings}
                  className="mt-4 ml-4 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-colors duration-200"
                >
                  সেটিংস
                </button>
              </>
            )}
          </div>
        )}
        
        {gameState === GameState.TYPING && (
           <div className="w-full flex flex-col items-center gap-6">
            <div className="flex gap-8 text-2xl font-mono">
                <div className="text-center">
                    <span className="text-sm text-slate-400">WPM</span>
                    <p className="text-sky-300">{liveStats.wpm}</p>
                </div>
                <div className="text-center">
                    <span className="text-sm text-slate-400">Accuracy</span>
                    <p className="text-sky-300">{liveStats.accuracy}%</p>
                </div>
            </div>
            <TypingArea lessonText={lessonText} onLessonComplete={handleLessonComplete} setLiveStats={setLiveStats} />
            <button
              onClick={resetLesson}
              className="mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors duration-200"
            >
              পাঠ রিসেট করুন
            </button>
           </div>
        )}

        {gameState === GameState.FINISHED && (
          <div className="text-center bg-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-2 text-emerald-400">পাঠ সম্পন্ন!</h2>
             <div className="font-mono text-lg my-4 flex justify-center gap-6">
                <p>WPM: <span className="text-white">{liveStats.wpm}</span></p>
                <p>Accuracy: <span className="text-white">{liveStats.accuracy}%</span></p>
            </div>
            {lastUnlocked && <p className="text-yellow-300 my-4 text-xl animate-pulse">নতুন অক্ষর আনলক হয়েছে: {lastUnlocked}</p>}
            <button
              onClick={startLesson}
              className="mt-4 px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-lg hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
              autoFocus // Add autoFocus here
            >
              পরবর্তী পাঠ
            </button>
            <button
              onClick={resetLesson}
              className="mt-4 ml-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors duration-200"
            >
              পাঠ রিসেট করুন
            </button>
            {!hasStartedTyping && ( // Conditionally render based on hasStartedTyping
              <>
                <button
                  onClick={handleViewProfile}
                  className="mt-4 ml-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors duration-200"
                >
                  প্রোফাইল দেখুন
                </button>
                <button
                  onClick={handleViewSettings}
                  className="mt-4 ml-4 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-colors duration-200"
                >
                  সেটিংস
                </button>
              </>
            )}
          </div>
        )}

        {gameState === GameState.PROFILE && userProgress && (
          <ProfilePage userProgress={userProgress} keymap={keymap} onBackToLobby={handleBackToLobby} />
        )}

        {gameState === GameState.SETTINGS && userProgress && (
          <SettingsPage
            userProgress={userProgress}
            proficiencyThreshold={proficiencyThreshold}
            onUpdateProficiencyThreshold={handleUpdateProficiencyThreshold}
            onToggleKeyLock={handleToggleKeyLock}
            onBackToLobby={handleBackToLobby}
            useAllUnlockedKeys={useAllUnlockedKeys}
            onToggleUseAllUnlockedKeys={handleToggleUseAllUnlockedKeys}
            onResetProgress={handleResetProgress}
          />
        )}

        <Controls onVocabUpload={handleVocabUpload} hasVocabulary={masterVocabulary.length > 0} />
        <Keyboard userProgress={userProgress} keymap={keymap} />
      </main>
    </div>
  );
};

export default App;
