
import { UserProgress, ProficiencyStats, CharacterStats } from '../types';
import { keymap, unlockOrder, INITIAL_UNLOCKED_KEYS_COUNT } from '../constants';

const PROGRESS_KEY = 'jatiyaTyper_progress';
const VOCABULARY_KEY = 'jatiyaTyper_vocabulary';

const createInitialProficiencyStats = (): ProficiencyStats => {
  const stats: ProficiencyStats = {};
  Object.values(keymap).forEach(keyDef => {
    const chars = [keyDef.normal];
    if (keyDef.shift) {
      chars.push(keyDef.shift);
    }
    chars.forEach(char => {
      if (!stats[char]) {
        stats[char] = {
          latency: [],
          errors: 0,
          attempts: 0,
          proficiency: 0.0,
        };
      }
    });
  });
  return stats;
};

const initializeNewUserProgress = (): UserProgress => {
  const initialProgress: UserProgress = {
    unlockedKeys: unlockOrder.slice(0, INITIAL_UNLOCKED_KEYS_COUNT),
    proficiencyStats: createInitialProficiencyStats(),
  };
  return initialProgress;
};

export const saveProgress = (progress: UserProgress): void => {
  try {
    const serializedState = JSON.stringify(progress);
    localStorage.setItem(PROGRESS_KEY, serializedState);
  } catch (error) {
    console.error("Could not save progress", error);
  }
};

export const loadProgress = (): UserProgress => {
  try {
    const serializedState = localStorage.getItem(PROGRESS_KEY);
    if (serializedState === null) {
      const newProgress = initializeNewUserProgress();
      saveProgress(newProgress);
      return newProgress;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Could not load progress", error);
    const newProgress = initializeNewUserProgress();
    saveProgress(newProgress);
    return newProgress;
  }
};

export const resetProgress = (): UserProgress => {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    const newProgress = initializeNewUserProgress();
    saveProgress(newProgress);
    return newProgress;
  } catch (error) {
    console.error("Could not reset progress", error);
    return initializeNewUserProgress();
  }
};

export const saveVocabulary = (vocabulary: string[]): void => {
  try {
    localStorage.setItem(VOCABULARY_KEY, JSON.stringify(vocabulary));
  } catch (error) {
    console.error("Could not save vocabulary", error);
  }
};

export const loadVocabulary = (): string[] | null => {
  try {
    const serializedVocab = localStorage.getItem(VOCABULARY_KEY);
    return serializedVocab ? JSON.parse(serializedVocab) : null;
  } catch (error) {
    console.error("Could not load vocabulary", error);
    return null;
  }
};
