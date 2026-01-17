import { useState, useEffect, useCallback } from 'react';
import { PracticeSession, SessionSettings, PuttResult } from '@/types/practice';

const SESSIONS_KEY = 'disc-golf-sessions';
const SETTINGS_KEY = 'disc-golf-settings';

// Helper to get sessions from localStorage
const getStoredSessions = (): PracticeSession[] => {
  const stored = localStorage.getItem(SESSIONS_KEY);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return parsed.map((s: PracticeSession) => ({
      ...s,
      startTime: new Date(s.startTime),
      endTime: s.endTime ? new Date(s.endTime) : undefined,
      sets: s.sets.map(set => ({
        ...set,
        startTime: new Date(set.startTime),
        endTime: set.endTime ? new Date(set.endTime) : undefined,
      })),
    }));
  } catch {
    return [];
  }
};

const getStoredSettings = (): SessionSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  const defaults: SessionSettings = { lastDiscsPerSet: 10, lastDistance: 20 };
  if (!stored) return defaults;

  try {
    const parsed = JSON.parse(stored) as Partial<SessionSettings>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
};

export function usePracticeData() {
  // Initialize state directly from localStorage
  const [sessions, setSessions] = useState<PracticeSession[]>(() => getStoredSessions());
  const [settings, setSettings] = useState<SessionSettings>(() => getStoredSettings());

  const saveSessions = useCallback((newSessions: PracticeSession[]) => {
    setSessions(newSessions);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
  }, []);

  const saveSettings = useCallback((newSettings: SessionSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  }, []);

  const createSession = useCallback((discsPerSet: number): PracticeSession => {
    const newSession: PracticeSession = {
      id: crypto.randomUUID(),
      userId: 'default-user',
      startTime: new Date(),
      defaultDiscsPerSet: discsPerSet,
      sets: [],
    };
    
    // Get fresh sessions from storage to avoid stale state
    const currentSessions = getStoredSessions();
    const updatedSessions = [...currentSessions, newSession];
    
    saveSessions(updatedSessions);
    saveSettings({ lastDiscsPerSet: discsPerSet });
    
    return newSession;
  }, [saveSessions, saveSettings]);

  const updateSession = useCallback((session: PracticeSession) => {
    // Get fresh sessions from storage
    const currentSessions = getStoredSessions();
    const updated = currentSessions.map(s => s.id === session.id ? session : s);
    saveSessions(updated);
  }, [saveSessions]);

  const endSession = useCallback((sessionId: string) => {
    const currentSessions = getStoredSessions();
    const updated = currentSessions.map(s => 
      s.id === sessionId ? { ...s, endTime: new Date() } : s
    );
    saveSessions(updated);
  }, [saveSessions]);

  const deleteSession = useCallback((sessionId: string) => {
    const currentSessions = getStoredSessions();
    const updated = currentSessions.filter(s => s.id !== sessionId);
    saveSessions(updated);
  }, [saveSessions]);

  const updateSet = useCallback((sessionId: string, setId: string, discsScored: number, discsThrown: number, puttResults?: PuttResult[], distance?: number) => {
    const currentSessions = getStoredSessions();
    const updated = currentSessions.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        sets: s.sets.map(set => 
          set.id === setId ? { ...set, discsScored, discsThrown, puttResults, distance } : set
        ),
      };
    });
    saveSessions(updated);
  }, [saveSessions]);

  const getSession = useCallback((sessionId: string): PracticeSession | undefined => {
    // Always read fresh from localStorage to ensure we get the latest
    const currentSessions = getStoredSessions();
    return currentSessions.find(s => s.id === sessionId);
  }, []);

  const getCompletedSessions = useCallback(() => {
    const currentSessions = getStoredSessions();
    return currentSessions.filter(s => s.endTime).sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }, []);

  const getStats = useCallback(() => {
    const completed = getCompletedSessions();
    const allSets = completed.flatMap(s => s.sets);
    
    const totalSets = allSets.length;
    const totalThrown = allSets.reduce((acc, s) => acc + s.discsThrown, 0);
    const totalScored = allSets.reduce((acc, s) => acc + s.discsScored, 0);
    const accuracy = totalThrown > 0 ? (totalScored / totalThrown) * 100 : 0;
    
    // Calculate streak (consecutive sessions with >70% accuracy)
    let streak = 0;
    for (const session of completed) {
      const sessionThrown = session.sets.reduce((acc, s) => acc + s.discsThrown, 0);
      const sessionScored = session.sets.reduce((acc, s) => acc + s.discsScored, 0);
      const sessionAccuracy = sessionThrown > 0 ? (sessionScored / sessionThrown) * 100 : 0;
      
      if (sessionAccuracy >= 70) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalSessions: completed.length,
      totalSets,
      totalThrown,
      totalScored,
      accuracy,
      streak,
    };
  }, [getCompletedSessions]);

  return {
    sessions,
    settings,
    createSession,
    updateSession,
    endSession,
    deleteSession,
    updateSet,
    getSession,
    getCompletedSessions,
    getStats,
    saveSettings,
  };
}
