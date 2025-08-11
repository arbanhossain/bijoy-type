
export interface CharacterStats {
  latency: number[];
  errors: number;
  attempts: number;
  proficiency: number;
}

export interface ProficiencyStats {
  [character: string]: CharacterStats;
}

export interface UserProgress {
  unlockedKeys: string[];
  proficiencyStats: ProficiencyStats;
}

export interface KeyDefinition {
  normal: string;
  shift?: string;
}

export interface KeyMap {
  [code: string]: KeyDefinition;
}

export enum GameState {
  LOBBY,
  TYPING,
  FINISHED,
  PROFILE,
}
