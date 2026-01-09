import { motion } from 'framer-motion';
import { Calendar, Target, Clock } from 'lucide-react';
import { Header } from '@/components/Header';
import { usePracticeData } from '@/hooks/usePracticeData';
import { format } from 'date-fns';

export default function History() {
  const { getCompletedSessions } = usePracticeData();
  const sessions = getCompletedSessions();

  const getSessionStats = (session: typeof sessions[0]) => {
    const totalThrown = session.sets.reduce((acc, s) => acc + s.discsThrown, 0);
    const totalScored = session.sets.reduce((acc, s) => acc + s.discsScored, 0);
    const accuracy = totalThrown > 0 ? (totalScored / totalThrown) * 100 : 0;
    
    const duration = session.endTime 
      ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
      : 0;
    
    return { totalThrown, totalScored, accuracy, duration };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="History" showBack />
      
      <div className="px-6 py-6">
        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground mb-2">
              No sessions yet
            </h2>
            <p className="text-muted-foreground">
              Complete a practice session to see it here
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => {
              const stats = getSessionStats(session);
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-5 card-elevated"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-display font-semibold text-foreground">
                        {format(new Date(session.startTime), 'EEEE, MMM d')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.startTime), 'h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-2xl text-primary">
                        {stats.accuracy.toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">accuracy</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {stats.totalScored}/{stats.totalThrown} made
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {stats.duration} min
                      </span>
                    </div>
                  </div>

                  {/* Set breakdown */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      {session.sets.length} sets
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {session.sets.map((set) => {
                        const setAccuracy = (set.discsScored / set.discsThrown) * 100;
                        return (
                          <div
                            key={set.id}
                            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                              setAccuracy >= 80 
                                ? 'bg-success/20 text-success' 
                                : setAccuracy >= 60 
                                ? 'bg-accent/20 text-accent-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {set.discsScored}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
