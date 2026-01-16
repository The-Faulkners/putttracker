import { motion } from 'framer-motion';
import { Trophy, Target, Clock, TrendingUp, Home, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PracticeSession } from '@/types/practice';
import { PuttResultsIndicator } from '@/components/PuttResultsIndicator';

interface SessionSummaryProps {
  session: PracticeSession;
  sessionDuration: number;
  onGoHome: () => void;
  onViewAnalysis: () => void;
}

export function SessionSummary({ session, sessionDuration, onGoHome, onViewAnalysis }: SessionSummaryProps) {
  const totalMade = session.sets.reduce((acc, s) => acc + s.discsScored, 0);
  const totalThrown = session.sets.reduce((acc, s) => acc + s.discsThrown, 0);
  const overallAccuracy = totalThrown > 0 ? (totalMade / totalThrown) * 100 : 0;
  
  // Get all putt results for the session
  const allPuttResults = session.sets.flatMap(s => s.puttResults || []);
  
  // Find best set
  const bestSet = session.sets.reduce((best, set) => {
    const setAccuracy = set.discsThrown > 0 ? (set.discsScored / set.discsThrown) * 100 : 0;
    const bestAccuracy = best && best.discsThrown > 0 ? (best.discsScored / best.discsThrown) * 100 : 0;
    return setAccuracy > bestAccuracy ? set : best;
  }, session.sets[0]);
  
  const bestSetAccuracy = bestSet && bestSet.discsThrown > 0 
    ? (bestSet.discsScored / bestSet.discsThrown) * 100 
    : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Get unique distances used
  const distances = [...new Set(session.sets.map(s => s.distance).filter(Boolean))];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col"
    >
      {/* Header celebration */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
        >
          <Trophy className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="font-display font-bold text-2xl text-foreground mb-1">
          Session Complete!
        </h2>
        <p className="text-muted-foreground">Great practice session</p>
      </div>

      {/* Main stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl p-6 card-elevated mb-4"
      >
        <div className="text-center mb-4">
          <div className="font-display font-bold text-5xl text-foreground mb-1">
            {overallAccuracy.toFixed(0)}%
          </div>
          <p className="text-muted-foreground">Overall Accuracy</p>
        </div>
        
        <div className="flex justify-center gap-8 text-center">
          <div>
            <div className="font-bold text-2xl text-success">{totalMade}</div>
            <div className="text-sm text-muted-foreground">Made</div>
          </div>
          <div className="w-px bg-border" />
          <div>
            <div className="font-bold text-2xl text-foreground">{totalThrown}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
        </div>
      </motion.div>

      {/* Session details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <div className="bg-card rounded-xl p-4 card-elevated">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Target className="w-4 h-4" />
            <span className="text-sm">Sets</span>
          </div>
          <div className="font-bold text-xl text-foreground">{session.sets.length}</div>
        </div>
        
        <div className="bg-card rounded-xl p-4 card-elevated">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Duration</span>
          </div>
          <div className="font-bold text-xl text-foreground">{formatDuration(sessionDuration)}</div>
        </div>
        
        {bestSet && session.sets.length > 1 && (
          <div className="bg-card rounded-xl p-4 card-elevated col-span-2">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Best Set</span>
            </div>
            <div className="font-bold text-xl text-primary">
              {bestSetAccuracy.toFixed(0)}% ({bestSet.discsScored}/{bestSet.discsThrown})
              {bestSet.distance && <span className="text-muted-foreground font-normal text-base ml-2">@ {bestSet.distance}ft</span>}
            </div>
          </div>
        )}
      </motion.div>

      {/* Distances practiced */}
      {distances.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-xl p-4 card-elevated mb-4"
        >
          <div className="text-sm text-muted-foreground mb-2">Distances Practiced</div>
          <div className="flex flex-wrap gap-2">
            {distances.sort((a, b) => (a || 0) - (b || 0)).map(d => (
              <span key={d} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {d}ft
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Putt results visualization */}
      {allPuttResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-4 card-elevated mb-6"
        >
          <div className="text-sm text-muted-foreground mb-3">All Putts</div>
          <PuttResultsIndicator results={allPuttResults} size="sm" className="justify-start" />
        </motion.div>
      )}

      {/* Actions */}
      <div className="mt-auto space-y-3 pt-4">
        <Button
          onClick={onViewAnalysis}
          className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          View Analysis
        </Button>
        
        <Button
          variant="outline"
          onClick={onGoHome}
          className="w-full h-12"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </motion.div>
  );
}
