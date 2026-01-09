import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Target, Check, Plus, Square, Timer } from 'lucide-react';
import { Header } from '@/components/Header';
import { DiscCounter } from '@/components/DiscCounter';
import { Button } from '@/components/ui/button';
import { usePracticeData } from '@/hooks/usePracticeData';
import { PracticeSet } from '@/types/practice';

export default function ActiveSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getSession, updateSession, endSession } = usePracticeData();
  
  const session = getSession(sessionId || '');
  const [currentSet, setCurrentSet] = useState<PracticeSet | null>(null);
  const [discsScored, setDiscsScored] = useState(0);
  const [elapsed, setElapsed] = useState(0);

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

  if (!session) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startNewSet = () => {
    const newSet: PracticeSet = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      startTime: new Date(),
      discsThrown: session.defaultDiscsPerSet,
      discsScored: 0,
    };
    setCurrentSet(newSet);
    setDiscsScored(0);
    setElapsed(0);
  };

  const completeSet = () => {
    if (!currentSet) return;

    const completedSet: PracticeSet = {
      ...currentSet,
      endTime: new Date(),
      discsScored,
    };

    updateSession({
      ...session,
      sets: [...session.sets, completedSet],
    });

    setCurrentSet(null);
    setDiscsScored(0);
  };

  const handleEndSession = () => {
    endSession(session.id);
    navigate('/');
  };

  const totalThrown = session.sets.reduce((acc, s) => acc + s.discsThrown, 0);
  const totalScored = session.sets.reduce((acc, s) => acc + s.discsScored, 0);
  const accuracy = totalThrown > 0 ? ((totalScored / totalThrown) * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={currentSet ? `Set ${session.sets.length + 1}` : 'Session'}
        showBack={!currentSet}
        rightContent={
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="w-4 h-4" />
            <span className="font-mono text-sm">{formatTime(elapsed)}</span>
          </div>
        }
      />
      
      <div className="px-6 py-6">
        <AnimatePresence mode="wait">
          {currentSet ? (
            <motion.div
              key="active-set"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Active Set UI */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-accent mb-4 animate-pulse-soft">
                  <Target className="w-8 h-8 text-accent-foreground" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground mb-1">
                  Throwing {currentSet.discsThrown} discs
                </h2>
                <p className="text-muted-foreground">
                  How many did you make?
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 card-elevated mb-8">
                <DiscCounter
                  value={discsScored}
                  onChange={setDiscsScored}
                  max={currentSet.discsThrown}
                  label="Discs scored"
                />
                
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className="font-semibold text-foreground">
                      {((discsScored / currentSet.discsThrown) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={completeSet}
                className="w-full h-14 text-lg font-semibold bg-success hover:bg-success/90"
              >
                <Check className="w-5 h-5 mr-2" />
                Complete Set
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="session-overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Session Overview */}
              <div className="bg-card rounded-2xl p-6 card-elevated mb-6">
                <h3 className="font-display font-semibold text-lg mb-4">Session Stats</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{session.sets.length}</p>
                    <p className="text-xs text-muted-foreground">Sets</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalScored}/{totalThrown}</p>
                    <p className="text-xs text-muted-foreground">Made</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </div>

              {/* Set History */}
              {session.sets.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-display font-semibold text-sm text-muted-foreground mb-3">
                    Completed Sets
                  </h3>
                  <div className="space-y-2">
                    {session.sets.map((set, index) => (
                      <motion.div
                        key={set.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card rounded-lg p-4 flex justify-between items-center"
                      >
                        <span className="font-medium">Set {index + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            {set.discsScored}/{set.discsThrown}
                          </span>
                          <span className="font-semibold text-primary">
                            {((set.discsScored / set.discsThrown) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={startNewSet}
                  className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Set
                </Button>
                
                {session.sets.length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={handleEndSession}
                    className="w-full h-12"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
