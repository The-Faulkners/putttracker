import { useState, useEffect } from 'react';
import { PracticeSession, SessionSettings } from '@/types/practice';

const SESSIONS_KEY = 'disc-golf-sessions';
const SETTINGS_KEY = 'disc-golf-settings';

export function usePracticeData() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [settings, setSettings] = useState<SessionSettings>({ lastDiscsPerSet: 10 });

  useEffect(() => {
    const storedSessions = localStorage.getItem(SESSIONS_KEY);
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    
    if (storedSessions) {
      const parsed = JSON.parse(storedSessions);
      setSessions(parsed.map((s: PracticeSession) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined,
        sets: s.sets.map(set => ({
          ...set,
          startTime: new Date(set.startTime),
          endTime: set.endTime ? new Date(set.endTime) : undefined,
        })),
      })));
    }
    
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const saveSessions = (newSessions: PracticeSession[]) => {
    setSessions(newSessions);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
  };

  const saveSettings = (newSettings: SessionSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const createSession = (discsPerSet: number): PracticeSession => {
    const newSession: PracticeSession = {
      id: crypto.randomUUID(),
      userId: 'default-user',
      startTime: new Date(),
      defaultDiscsPerSet: discsPerSet,
      sets: [],
    };
    
    saveSettings({ lastDiscsPerSet: discsPerSet });
    saveSessions([...sessions, newSession]);
    
    return newSession;
  };

  const updateSession = (session: PracticeSession) => {
    const updated = sessions.map(s => s.id === session.id ? session : s);
    saveSessions(updated);
  };

  const endSession = (sessionId: string) => {
    const updated = sessions.map(s => 
      s.id === sessionId ? { ...s, endTime: new Date() } : s
    );
    saveSessions(updated);
  };

  const getSession = (sessionId: string) => {
    return sessions.find(s => s.id === sessionId);
  };

  const getCompletedSessions = () => {
    return sessions.filter(s => s.endTime).sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  };

  const getStats = () => {
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
  };

  return {
    sessions,
    settings,
    createSession,
    updateSession,
    endSession,
    getSession,
    getCompletedSessions,
    getStats,
  };
}
