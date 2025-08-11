import React from 'react';
import { UserProgress, KeyMap } from '../types';
import { keymap, unlockOrder } from '../constants';
import './SettingsPage.css';

interface SettingsPageProps {
  userProgress: UserProgress;
  proficiencyThreshold: number;
  onUpdateProficiencyThreshold: (threshold: number) => void;
  onToggleKeyLock: (key: string) => void;
  onBackToLobby: () => void;
  useAllUnlockedKeys: boolean;
  onToggleUseAllUnlockedKeys: (useAll: boolean) => void;
  onResetProgress: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  userProgress,
  proficiencyThreshold,
  onUpdateProficiencyThreshold,
  onToggleKeyLock,
  onBackToLobby,
  useAllUnlockedKeys,
  onToggleUseAllUnlockedKeys,
  onResetProgress,
}) => {

  const handleThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProficiencyThreshold(Number(event.target.value));
  };

  const renderKeyboardLayout = () => {
    // Filter keymap to only include keys present in unlockOrder
    const orderedKeys = unlockOrder.filter(key => keymap[key]);

    return (
      <div className="keyboard-layout">
        {orderedKeys.map(key => {
          const keyDef = keymap[key];
          const isLocked = !userProgress.unlockedKeys.includes(key);
          return (
            <button
              key={key}
              className={`key ${isLocked ? 'locked' : ''}`}
              onClick={() => onToggleKeyLock(key)}
            >
              {keyDef.normal}
              {keyDef.shift && <span className="shift-char">{keyDef.shift}</span>}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-card">
        <h2>Proficiency Threshold</h2>
        <label htmlFor="proficiency-slider">Set minimum proficiency for new keys:</label>
        <input
          type="range"
          id="proficiency-slider"
          min="0"
          max="100"
          value={Math.round(proficiencyThreshold * 100)} // Convert 0-1 to 0-100
          onChange={handleThresholdChange}
        />
        <span>{Math.round(proficiencyThreshold * 100)}%</span>
      </div>

      <div className="settings-card">
        <h2>Lesson Character Selection</h2>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-indigo-600"
            checked={useAllUnlockedKeys}
            onChange={(e) => onToggleUseAllUnlockedKeys(e.target.checked)}
          />
          <span className="ml-2 text-gray-700">Use all unlocked letters instead of a subset</span>
        </label>
      </div>

      <div className="settings-card">
        <h2>Unlock Keys Manually</h2>
        <p>Click on a key to toggle its locked/unlocked state.</p>
        {renderKeyboardLayout()}
      </div>

      <div className="settings-card">
        <h2>Reset Progress</h2>
        <p>This will reset all your typing progress and unlocked keys.</p>
        <button
          onClick={onResetProgress}
          className="mt-4 px-6 py-2 bg-rose-700 text-white font-semibold rounded-lg shadow-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-75 transition-colors duration-200"
        >
          Reset All Progress
        </button>
      </div>

      <button
        onClick={onBackToLobby}
        className="mt-8 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors duration-200"
      >
        Back to Lobby
      </button>
    </div>
  );
};

export default SettingsPage;
