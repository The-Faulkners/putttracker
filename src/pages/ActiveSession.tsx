import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Target, Check, X, RotateCcw, Square, Timer, ChevronRight, Ruler, Sun, Mic, MicOff } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { usePracticeData } from '@/hooks/usePracticeData';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { PracticeSet, PuttResult } from '@/types/practice';
import { generateId } from '@/lib/utils';
import { PuttResultsIndicator } from '@/components/PuttResultsIndicator';
import { SessionSummary } from '@/components/SessionSummary';

export default function ActiveSession() {
  const {
    sessionId
  } = useParams<{
    sessionId: string;
  }>();
  const navigate = useNavigate();
  const {
    getSession,
    updateSession,
    endSession,
    settings,
    saveSettings
  } = usePracticeData();
  const session = getSession(sessionId || '');
  const { isSupported: wakeLockSupported, isActive: wakeLockActive, toggleWakeLock } = useWakeLock();
  const [currentSet, setCurrentSet] = useState<PracticeSet | null>(null);
  const [madeCount, setMadeCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [puttResults, setPuttResults] = useState<PuttResult[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [currentDistance, setCurrentDistance] = useState<number | undefined>(undefined);
  const totalPutts = madeCount + missedCount;
  const discsPerSet = session?.defaultDiscsPerSet || 10;
  const remainingPutts = discsPerSet - totalPutts;
  const isSetComplete = totalPutts >= discsPerSet;

  // Voice recognition handlers - wrapped in useCallback to prevent infinite loops
  const voiceHandleMade = useCallback(() => {
    if (totalPutts < discsPerSet) {
      setMadeCount(prev => prev + 1);
      setPuttResults(prev => [...prev, 'made']);
    }
  }, [totalPutts, discsPerSet]);

  const voiceHandleMissed = useCallback(() => {
    if (totalPutts < discsPerSet) {
      setMissedCount(prev => prev + 1);
      setPuttResults(prev => [...prev, 'missed']);
    }
  }, [totalPutts, discsPerSet]);

  const voiceHandleUndo = useCallback(() => {
    if (puttResults.length > 0) {
      const lastResult = puttResults[puttResults.length - 1];
      setPuttResults(prev => prev.slice(0, -1));
      if (lastResult === 'made') {
        setMadeCount(prev => prev - 1);
      } else {
        setMissedCount(prev => prev - 1);
      }
    }
  }, [puttResults]);

  const {
    isListening,
    isSupported: voiceSupported,
    toggleListening,
    lastHeard,
    error: voiceError,
  } = useVoiceRecognition({
    onMade: voiceHandleMade,
    onMissed: voiceHandleMissed,
    onUndo: voiceHandleUndo,
    enabled: !showSummary && !showSessionSummary && !isSetComplete,
  });

  // Start first set automatically and set initial distance from previous set
  useEffect(() => {
    if (session && !currentSet && !showSummary) {
      // Get distance from last set of this session, or fall back to settings
      const nextDistance = settings.lastDistance ?? 20;
      setCurrentDistance(nextDistance);
      startNewSet();
    }
  }, [session]);
  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }
    const timer = setInterval(() => {
      const start = currentSet ? new Date(currentSet.startTime) : new Date(session.startTime);
      setElapsed(Math.floor((Date.now() - start.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [session, currentSet, navigate]);
  const startNewSet = useCallback(() => {
    if (!session) return;
    
    // Get distance from last set (if present) or fall back to last-used distance
    const previousSetDistance = session.sets.length > 0
      ? session.sets[session.sets.length - 1].distance
      : undefined;
    const lastSetDistance = previousSetDistance ?? settings.lastDistance ?? 20;
    
    const newSet: PracticeSet = {
      id: generateId(),
      sessionId: session.id,
      startTime: new Date(),
      discsThrown: session.defaultDiscsPerSet,
      discsScored: 0,
      distance: lastSetDistance,
      puttResults: []
    };
    setCurrentSet(newSet);
    setMadeCount(0);
    setMissedCount(0);
    setPuttResults([]);
    setCurrentDistance(lastSetDistance);
    setElapsed(0);
    setShowSummary(false);
  }, [session, settings.lastDistance]);
  if (!session) return null;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const handleMade = () => {
    if (isSetComplete) return;
    setMadeCount(prev => prev + 1);
    setPuttResults(prev => [...prev, 'made']);
  };
  const handleMissed = () => {
    if (isSetComplete) return;
    setMissedCount(prev => prev + 1);
    setPuttResults(prev => [...prev, 'missed']);
  };
  const handleUndo = () => {
    if (puttResults.length > 0) {
      const lastResult = puttResults[puttResults.length - 1];
      setPuttResults(prev => prev.slice(0, -1));
      if (lastResult === 'made') {
        setMadeCount(prev => prev - 1);
      } else {
        setMissedCount(prev => prev - 1);
      }
    }
  };
  const handleDistanceChange = (value: string) => {
    const distance = value ? parseInt(value, 10) : undefined;
    setCurrentDistance(distance);
    if (distance) {
      saveSettings({ ...settings, lastDistance: distance });
    }
  };
  const completeSet = () => {
    if (!currentSet) return;
    const completedSet: PracticeSet = {
      ...currentSet,
      endTime: new Date(),
      discsThrown: totalPutts,
      discsScored: madeCount,
      distance: currentDistance,
      puttResults: puttResults
    };
    updateSession({
      ...session,
      sets: [...session.sets, completedSet]
    });
    // Save distance to settings so it persists to next session
    if (currentDistance) {
      saveSettings({ ...settings, lastDistance: currentDistance });
    }
    setShowSummary(true);
    setCurrentSet(null);
  };
  const handleEndSession = () => {
    // Calculate total session duration
    const totalDuration = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
    setSessionDuration(totalDuration);
    endSession(session.id);
    setShowSessionSummary(true);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewAnalysis = () => {
    navigate('/analysis');
  };
  const accuracy = totalPutts > 0 ? madeCount / totalPutts * 100 : 0;

  // Session totals
  const sessionMade = session.sets.reduce((acc, s) => acc + s.discsScored, 0) + (showSummary ? 0 : madeCount);
  const sessionThrown = session.sets.reduce((acc, s) => acc + s.discsThrown, 0) + (showSummary ? 0 : totalPutts);
  const sessionAccuracy = sessionThrown > 0 ? sessionMade / sessionThrown * 100 : 0;
  // Show session summary screen
  if (showSessionSummary) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header title="Session Summary" />
        <div className="flex-1 px-6 py-4 flex flex-col">
          <SessionSummary
            session={session}
            sessionDuration={sessionDuration}
            onGoHome={handleGoHome}
            onViewAnalysis={handleViewAnalysis}
          />
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-background flex flex-col">
      <Header title={showSummary ? 'Set Complete' : `Set ${session.sets.length + 1}`} rightContent={<div className="flex items-center gap-3">
            {voiceSupported && !showSummary && (
              <button 
                onClick={toggleListening}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${isListening ? 'bg-success/20 text-success animate-pulse' : 'text-muted-foreground'}`}
                title={isListening ? 'Voice active - say "made" or "miss"' : 'Enable voice input'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            )}
            {wakeLockSupported && (
              <button 
                onClick={toggleWakeLock}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${wakeLockActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
              >
                <Sun className="w-4 h-4" />
                <Switch checked={wakeLockActive} className="scale-75" />
              </button>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(elapsed)}</span>
            </div>
          </div>} />
      
      <div className="flex-1 px-6 py-4 flex flex-col">
        <AnimatePresence mode="wait">
          {showSummary ? <motion.div key="summary" initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.95
        }} className="flex-1 flex flex-col">
              {/* Set Summary */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div initial={{
              scale: 0
            }} animate={{
              scale: 1
            }} transition={{
              type: "spring",
              delay: 0.2
            }} className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6">
                  <Check className="w-12 h-12 text-success" />
                </motion.div>
                
                <h2 className="font-display font-bold text-3xl text-foreground mb-2">
                  {madeCount} / {totalPutts}
                </h2>
                <p className="text-xl text-primary font-semibold mb-4">
                  {accuracy.toFixed(0)}% accuracy
                </p>
                
                {/* Putt Results Indicator */}
                <PuttResultsIndicator results={puttResults} size="md" className="justify-center max-w-xs mb-8" />

                {/* Session Stats */}
                <div className="bg-card rounded-xl p-5 w-full card-elevated">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Session Total</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">{sessionMade} / {sessionThrown} made</span>
                    <span className="font-bold text-primary">{sessionAccuracy.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-6">
                <Button onClick={startNewSet} className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90">
                  Next Set
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button variant="outline" onClick={handleEndSession} className="w-full h-12">
                  <Square className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              </div>
            </motion.div> : <motion.div key="tracking" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="flex-1 flex flex-col">
              {/* Distance Input */}
              <div className="mb-4 flex items-center gap-3 bg-card rounded-xl p-3 card-elevated">
                <Ruler className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Distance:</span>
                <Input
                  type="number"
                  value={currentDistance || ''}
                  onChange={(e) => handleDistanceChange(e.target.value)}
                  placeholder="feet"
                  className="w-20 h-8 text-center"
                />
                <span className="text-sm text-muted-foreground">ft</span>
                
                {/* Voice status indicator */}
                {isListening && (
                  <div className="ml-auto flex items-center gap-2 text-success text-xs">
                    <Mic className="w-3 h-3 animate-pulse" />
                    <span>Listening{lastHeard ? `: "${lastHeard}"` : ''}</span>
                  </div>
                )}
                {voiceError && (
                  <div className="ml-auto text-destructive text-xs">
                    {voiceError}
                  </div>
                )}
              </div>

              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Putt {totalPutts + 1} of {discsPerSet}</span>
                  <span className="font-medium text-foreground">{remainingPutts} remaining</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div className="h-full gradient-primary" initial={{
                width: 0
              }} animate={{
                width: `${totalPutts / discsPerSet * 100}%`
              }} transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }} />
                </div>
              </div>

              {/* Score Display */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <motion.div key={`${madeCount}-${missedCount}`} initial={{
                scale: 1.1
              }} animate={{
                scale: 1
              }} className="mb-2">
                    <span className="font-display font-bold text-6xl text-foreground">
                      {madeCount}
                    </span>
                    <span className="font-display font-bold text-4xl text-muted-foreground mx-2">/</span>
                    <span className="font-display font-bold text-4xl text-muted-foreground">
                      {totalPutts}
                    </span>
                  </motion.div>
                  <p className="text-xl font-semibold text-primary mb-4">
                    {accuracy.toFixed(0)}%
                  </p>
                  
                  {/* Putt Results Indicator */}
                  {puttResults.length > 0 && (
                    <PuttResultsIndicator results={puttResults} size="md" className="justify-center max-w-xs" />
                  )}
                </div>

                {/* Missed / Made Buttons */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <motion.button onClick={handleMissed} disabled={isSetComplete} className="aspect-square rounded-2xl bg-destructive/10 border-2 border-destructive flex flex-col items-center justify-center gap-2 transition-all hover:bg-destructive/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" whileTap={{
                scale: 0.95
              }}>
                    <X className="w-12 h-12 text-destructive" />
                    <span className="font-display font-bold text-lg text-destructive">Missed</span>
                    <span className="text-2xl font-bold text-destructive">{missedCount}</span>
                  </motion.button>

                  <motion.button onClick={handleMade} disabled={isSetComplete} className="aspect-square rounded-2xl bg-success/10 border-2 border-success flex flex-col items-center justify-center gap-2 transition-all hover:bg-success/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" whileTap={{
                scale: 0.95
              }}>
                    <Check className="w-12 h-12 text-success" />
                    <span className="font-display font-bold text-lg text-success">Made</span>
                    <span className="text-2xl font-bold text-success">{madeCount}</span>
                  </motion.button>
                </div>

                {/* Undo button */}
                {totalPutts > 0 && !isSetComplete && <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="mt-6">
                    <Button variant="ghost" size="sm" onClick={handleUndo} className="text-muted-foreground">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Undo last
                    </Button>
                  </motion.div>}
              </div>

              {/* Complete Set Button */}
              {isSetComplete && <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="pt-4 py-[52px]">
                  <Button onClick={completeSet} className="w-full h-14 text-lg font-semibold bg-success hover:bg-success/90">
                    <Check className="w-5 h-5 mr-2" />
                    Complete Set
                  </Button>
                </motion.div>}
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}