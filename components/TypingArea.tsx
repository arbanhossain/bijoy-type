import React, { useState, useEffect, useCallback, useRef } from 'react';
import { keymap } from '../constants';
import { CharacterStats } from '../types';

interface TypingAreaProps {
  lessonText: string;
  onLessonComplete: (stats: { [char: string]: Omit<CharacterStats, 'proficiency'> }) => void;
  setLiveStats: (stats: { wpm: number; accuracy: number }) => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({ lessonText, onLessonComplete, setLiveStats }) => {
  const [charStates, setCharStates] = useState<('upcoming' | 'correct' | 'incorrect')[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Core stats for proficiency
  const lessonStats = useRef<{ [char: string]: Omit<CharacterStats, 'proficiency'> }>({});
  
  // Stats for live display
  const lastKeyPressTime = useRef<number>(Date.now());
  const startTime = useRef<number>(Date.now());
  const correctStrokes = useRef(0);
  
  // New refs for word-based accuracy
  const totalWords = useRef(0);
  const correctWords = useRef(0);
  const isCurrentWordCorrect = useRef(true);

  useEffect(() => {
    // Resetting state for a new lesson
    setCharStates(Array(lessonText.length).fill('upcoming'));
    setCurrentIndex(0);
    
    // Reset proficiency stats
    lessonStats.current = {};

    // Reset live stats timers and counters
    lastKeyPressTime.current = Date.now();
    startTime.current = Date.now();
    correctStrokes.current = 0;

    // Reset word-based accuracy counters
    totalWords.current = 0;
    correctWords.current = 0;
    isCurrentWordCorrect.current = true;
    
    // Reset display
    setLiveStats({ wpm: 0, accuracy: 100 });
  }, [lessonText, setLiveStats]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    event.preventDefault();

    // Guard against typing after lesson is finished
    if (currentIndex >= lessonText.length) return;
    
    // Map browser key event to a character from our keymap
    const keyDef = keymap[event.code];
    if (!keyDef) return; // Ignore unmapped keys like CapsLock
    const pressedChar = event.shiftKey ? keyDef.shift : keyDef.normal;
    if (pressedChar === undefined) return; // Ignore keys with no value for the current shift state

    const expectedChar = lessonText[currentIndex];
    const isCorrect = pressedChar === expectedChar;
    const timeTaken = Date.now() - lastKeyPressTime.current;
    lastKeyPressTime.current = Date.now();

    // --- Update Per-Character Proficiency Stats ---
    if (!lessonStats.current[expectedChar]) {
        lessonStats.current[expectedChar] = { latency: [], errors: 0, attempts: 0 };
    }
    lessonStats.current[expectedChar].attempts += 1;
    if (isCorrect) {
        lessonStats.current[expectedChar].latency.push(timeTaken);
        correctStrokes.current += 1;
    } else {
        lessonStats.current[expectedChar].errors += 1;
        isCurrentWordCorrect.current = false;
    }

    // --- Update Visual State ---
    setCharStates(prevStates => {
        const newStates = [...prevStates];
        newStates[currentIndex] = isCorrect ? 'correct' : 'incorrect';
        return newStates;
    });

    // --- Check for Word Boundary & Update Word-based Accuracy ---
    const isLastCharOfLesson = currentIndex + 1 === lessonText.length;
    if (expectedChar === ' ' || isLastCharOfLesson) {
        totalWords.current += 1;
        if (isCurrentWordCorrect.current) {
            correctWords.current += 1;
        }
        isCurrentWordCorrect.current = true; // Reset for the next word
    }
    
    // --- Update Live WPM and Accuracy Display ---
    const accuracy = totalWords.current > 0 ? (correctWords.current / totalWords.current) * 100 : 100;
    const elapsedMinutes = (Date.now() - startTime.current) / 60000;
    const wpm = elapsedMinutes > 0 ? ((correctStrokes.current / 5) / elapsedMinutes) : 0;
    setLiveStats({ wpm: Math.round(wpm), accuracy: Math.round(accuracy) });

    // --- Lesson Completion ---
    if (isLastCharOfLesson) {
        onLessonComplete(lessonStats.current);
    }

    // --- Advance to next character (non-blocking) ---
    setCurrentIndex(prev => prev + 1);

  }, [currentIndex, lessonText, onLessonComplete, setLiveStats]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getCharClass = (index: number) => {
    const state = charStates[index];
    let className = 'text-3xl md:text-4xl p-1 rounded transition-colors duration-200 ';
    if (state === 'correct') className += 'text-emerald-400';
    else if (state === 'incorrect') className += 'text-rose-500 bg-rose-900/50';
    else className += 'text-slate-400';

    if (index === currentIndex) {
      className += ' bg-slate-700 border-b-2 border-sky-400 blinking-cursor';
    }
    return className;
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-full">
      <div id="words-container" className="flex flex-wrap leading-relaxed tracking-wider">
        {lessonText.split('').map((char, index) => (
          <span key={`${char}-${index}`} className={getCharClass(index)}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TypingArea;
