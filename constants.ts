import { KeyMap } from './types';

export const INITIAL_UNLOCKED_KEYS_COUNT = 5;
export const PRACTICE_CHAR_COUNT = 6;
export const LESSON_WORD_COUNT = 15;

export const keymap: KeyMap = {
  Backquote: { normal: '`', shift: '~' },
  Digit1: { normal: '১', shift: '!' },
  Digit2: { normal: '২', shift: '৥' },
  Digit3: { normal: '৩', shift: '#' },
  Digit4: { normal: '৪', shift: '৳' },
  Digit5: { normal: '৫', shift: '%' },
  Digit6: { normal: '৬', shift: '঳' },
  Digit7: { normal: '৭', shift: 'ঁ' },
  Digit8: { normal: '৮', shift: '*' },
  Digit9: { normal: '৯', shift: '(' },
  Digit0: { normal: '০', shift: ')' },
  Minus: { normal: '-', shift: '_' },
  Equal: { normal: '=', shift: '+' },
  KeyQ: { normal: 'ঙ', shift: 'ং' },
  KeyW: { normal: 'য', shift: 'য়' },
  KeyE: { normal: 'ড', shift: 'ঢ' },
  KeyR: { normal: 'প', shift: 'ফ' },
  KeyT: { normal: 'ট', shift: 'ঠ' },
  KeyY: { normal: 'চ', shift: 'ছ' },
  KeyU: { normal: 'জ', shift: 'ঝ' },
  KeyI: { normal: 'হ', shift: 'ঞ' },
  KeyO: { normal: 'গ', shift: 'ঘ' },
  KeyP: { normal: 'ড়', shift: 'ঢ়' },
  BracketLeft: { normal: 'ৎ', shift: 'ঃ' },
  BracketRight: { normal: ']', shift: '}' },
  KeyA: { normal: 'ৃ', shift: 'র্' },
  KeyS: { normal: 'ু', shift: 'ূ' },
  KeyD: { normal: 'ি', shift: 'ী' },
  KeyF: { normal: 'া', shift: 'অ' },
  KeyG: { normal: '্', shift: '।'},
  KeyH: { normal: 'ব', shift: 'ভ' },
  KeyJ: { normal: 'ক', shift: 'খ' },
  KeyK: { normal: 'ত', shift: 'থ' },
  KeyL: { normal: 'দ', shift: 'ধ' },
  Semicolon: { normal: 'চ', shift: 'ছ' }, // Duplicate on Y, adjusted for logical layout
  Quote: { normal: "'", shift: '"' },
  KeyZ: { normal: '্র', shift: '্য' },
  KeyX: { normal: 'ও', shift: 'ৗ' },
  KeyC: { normal: 'ে', shift: 'ৈ' },
  KeyV: { normal: 'র', shift: 'ল' },
  KeyB: { normal: 'ন', shift: 'ণ' },
  KeyN: { normal: 'স', shift: 'ষ' },
  KeyM: { normal: 'ম', shift: 'শ' },
  Comma: { normal: ',', shift: '<' },
  Period: { normal: '.', shift: '>' },
  Slash: { normal: '?', shift: '/' },
  Space: { normal: ' ' },
};


export const unlockOrder: string[] = [
  'KeyJ', 'KeyF', 'KeyK', 'KeyD', 'KeyL', 'KeyS', 'KeyH', 'KeyG', 'KeyA', // Home row
  'KeyY', 'KeyR', 'KeyU', 'KeyE', 'KeyI', 'KeyT', 'KeyO', 'KeyW', 'KeyP', 'KeyQ', // Top row
  'KeyB', 'KeyN', 'KeyV', 'KeyM', 'KeyC', 'KeyX', 'KeyZ', 'Comma', 'Period', // Bottom row
  'Digit4', 'Digit7', 'BracketLeft', 'KeyG', // For shift characters: ৳, ঁ, ৎ, ।
  'Digit1', 'Digit2', 'Digit3', 'Digit5', 'Digit6', 'Digit8', 'Digit9', 'Digit0', // Numbers
  // The rest will be unlocked implicitly as they share keys
];
