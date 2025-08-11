
import { UserProgress, KeyDefinition } from '../types';
import { keymap, PRACTICE_CHAR_COUNT, LESSON_WORD_COUNT } from '../constants';
import * as ProgressService from './progressService';

const getCharsFromKeys = (keys: string[]): string[] => {
  const charSet = new Set<string>();
  keys.forEach(key => {
    const keyDef: KeyDefinition | undefined = keymap[key];
    if (keyDef) {
      charSet.add(keyDef.normal);
      if (keyDef.shift) {
        charSet.add(keyDef.shift);
      }
    }
  });
  return Array.from(charSet);
};

export const selectPracticeCharacters = (progress: UserProgress): string[] => {
  const unlockedChars = getCharsFromKeys(progress.unlockedKeys);
  
  const sortedChars = unlockedChars.sort((a, b) => {
    const profA = progress.proficiencyStats[a]?.proficiency || 0;
    const profB = progress.proficiencyStats[b]?.proficiency || 0;
    return profA - profB;
  });

  const useAllUnlockedKeys = ProgressService.loadUseAllUnlockedKeys();

  if (useAllUnlockedKeys) {
    return unlockedChars;
  } else {
    return sortedChars.slice(0, PRACTICE_CHAR_COUNT);
  }
};

export const generatePracticeText = (progress: UserProgress, vocabulary: string[]): string => {
  const useAllUnlockedKeys = ProgressService.loadUseAllUnlockedKeys();
  let targetChars: string[];

  if (useAllUnlockedKeys) {
    targetChars = getCharsFromKeys(progress.unlockedKeys);
  } else {
    targetChars = selectPracticeCharacters(progress);
  }
  
  let wordPool = filterVocabulary(vocabulary, targetChars);

  if (wordPool.length < LESSON_WORD_COUNT) {
    const allUnlockedChars = getCharsFromKeys(progress.unlockedKeys);
    wordPool = filterVocabulary(vocabulary, allUnlockedChars);
  }

  if (wordPool.length === 0) {
    return "অনুশীলনের জন্য শব্দ পাওয়া যায়নি। অনুগ্রহ করে একটি নতুন শব্দভান্ডার ফাইল আপলোড করুন।";
  }

  const shuffledWords = wordPool.sort(() => 0.5 - Math.random());
  return shuffledWords.slice(0, LESSON_WORD_COUNT).join(' ');
};

const filterVocabulary = (vocabulary: string[], allowedChars: string[]): string[] => {
  const allowedCharSet = new Set(allowedChars);
  return vocabulary.filter(word => {
    // Also allow spaces in words for multi-word entries, and hoshonto for joining characters
    const essentialChars = new Set([...allowedChars, ' ', '্']);
    return [...word].every(char => essentialChars.has(char));
  });
};
