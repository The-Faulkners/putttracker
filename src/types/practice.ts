export interface PracticeSet {
  id: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  discsThrown: number;
  discsScored: number;
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
}
