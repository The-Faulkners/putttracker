export type PuttResult = 'made' | 'missed';

export interface PracticeSet {
  id: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  discsThrown: number;
  discsScored: number;
  distance?: number; // Distance in feet
  puttResults?: PuttResult[]; // Individual putt results in order
}

export interface PracticeSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  defaultDiscsPerSet: number;
  sets: PracticeSet[];
}

export interface SessionSettings {
  lastDiscsPerSet: number;
  lastDistance?: number; // Last used distance in feet
}
