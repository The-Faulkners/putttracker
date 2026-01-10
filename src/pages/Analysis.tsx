import { motion } from 'framer-motion';
import { TrendingUp, Target, Flame, Trophy, Disc, BarChart3, Zap } from 'lucide-react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { usePracticeData } from '@/hooks/usePracticeData';

export default function Analysis() {
  const { getStats, getCompletedSessions } = usePracticeData();
  const stats = getStats();
  const sessions = getCompletedSessions();

  // Calculate recent trend (last 5 vs previous 5)
  const getTrend = () => {
    if (sessions.length < 2) return null;
    
    const recent = sessions.slice(0, Math.min(5, sessions.length));
    const previous = sessions.slice(5, 10);
    
    if (previous.length === 0) return null;
    
    const recentAccuracy = recent.reduce((acc, s) => {
      const thrown = s.sets.reduce((a, set) => a + set.discsThrown, 0);
      const scored = s.sets.reduce((a, set) => a + set.discsScored, 0);
      return acc + (thrown > 0 ? scored / thrown : 0);
    }, 0) / recent.length * 100;
    
    const previousAccuracy = previous.reduce((acc, s) => {
      const thrown = s.sets.reduce((a, set) => a + set.discsThrown, 0);
      const scored = s.sets.reduce((a, set) => a + set.discsScored, 0);
      return acc + (thrown > 0 ? scored / thrown : 0);
    }, 0) / previous.length * 100;
    
    return recentAccuracy - previousAccuracy;
  };

  const trend = getTrend();

  // Find best session
  const getBestSession = () => {
    if (sessions.length === 0) return null;
    
    let best = sessions[0];
    let bestAccuracy = 0;
    
    for (const session of sessions) {
      const thrown = session.sets.reduce((a, s) => a + s.discsThrown, 0);
      const scored = session.sets.reduce((a, s) => a + s.discsScored, 0);
      const accuracy = thrown > 0 ? (scored / thrown) * 100 : 0;
      
      if (accuracy > bestAccuracy) {
        best = session;
        bestAccuracy = accuracy;
      }
    }
    
    return { session: best, accuracy: bestAccuracy };
  };

  // Calculate longest made streak across all sessions
  const getLongestMadeStreak = () => {
    let longestStreak = 0;
    
    for (const session of sessions) {
      for (const set of session.sets) {
        if (!set.puttResults) continue;
        
        let currentStreak = 0;
        for (const result of set.puttResults) {
          if (result === 'made') {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        }
      }
    }
    
    return longestStreak;
  };

  const bestSession = getBestSession();
  const longestMadeStreak = getLongestMadeStreak();

  return (
    <div className="min-h-screen bg-background">
      <Header title="Analysis" showBack />
      
      <div className="px-6 py-6">
        {stats.totalSessions === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground mb-2">
              No data yet
            </h2>
            <p className="text-muted-foreground">
              Complete some practice sessions to see your stats
            </p>
          </motion.div>
        ) : (
          <>
            {/* Overall Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="font-display font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wide">
                Overall Performance
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  icon={Target} 
                  label="Accuracy" 
                  value={`${stats.accuracy.toFixed(1)}%`}
                  delay={0.1}
                />
                <StatCard 
                  icon={Disc} 
                  label="Total Putts" 
                  value={stats.totalThrown}
                  subtext={`${stats.totalScored} made`}
                  delay={0.2}
                />
                <StatCard 
                  icon={Trophy} 
                  label="Sessions" 
                  value={stats.totalSessions}
                  delay={0.3}
                />
                <StatCard 
                  icon={Flame} 
                  label="Hot Streak" 
                  value={stats.streak}
                  subtext="sessions ≥70%"
                  delay={0.4}
                />
              </div>
            </motion.div>

            {/* Trend */}
            {trend !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="font-display font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wide">
                  Recent Trend
                </h2>
                <div className={`bg-card rounded-xl p-5 card-elevated flex items-center gap-4 ${
                  trend >= 0 ? 'border-l-4 border-success' : 'border-l-4 border-destructive'
                }`}>
                  <div className={`p-3 rounded-full ${
                    trend >= 0 ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    <TrendingUp className={`w-6 h-6 ${
                      trend >= 0 ? 'text-success' : 'text-destructive rotate-180'
                    }`} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xl text-foreground">
                      {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      vs previous sessions
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Best Session */}
            {bestSession && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="font-display font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wide">
                  Personal Best
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-5 border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <span className="font-display font-bold text-2xl text-primary">
                        {bestSession.accuracy.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Best session accuracy
                    </p>
                  </div>
                  {longestMadeStreak > 0 && (
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-5 border border-primary/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <span className="font-display font-bold text-2xl text-primary">
                          {longestMadeStreak}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Putts in a row
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
