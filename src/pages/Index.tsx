import { motion } from 'framer-motion';
import { Play, History, BarChart3, Target, Flame, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '@/components/ActionButton';
import { StatCard } from '@/components/StatCard';
import { usePracticeData } from '@/hooks/usePracticeData';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefresh } from '@/components/PullToRefresh';

const Index = () => {
  const navigate = useNavigate();
  const { getStats } = usePracticeData();
  const stats = getStats();
  
  const { pullDistance, threshold, isRefreshing } = usePullToRefresh();

  return (
    <div className="min-h-screen bg-background">
      <PullToRefresh 
        pullDistance={pullDistance} 
        threshold={threshold} 
        isRefreshing={isRefreshing} 
      />
      {/* Hero Section */}
      <div className="gradient-hero px-6 pt-12 pb-8 py-px">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4">
            <Target className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            Putt Tracker
          </h1>
          <p className="text-muted-foreground">
            Track your disc golf putting practice
          </p>
        </motion.div>

        {/* Quick Stats */}
        {stats.totalSessions > 0 && <div className="grid grid-cols-3 gap-3 mb-8">
            <StatCard icon={Trophy} label="Sessions" value={stats.totalSessions} delay={0.1} />
            <StatCard icon={Target} label="Accuracy" value={`${stats.accuracy.toFixed(0)}%`} delay={0.2} />
            <StatCard icon={Flame} label="Streak" value={stats.streak} subtext="sessions" delay={0.3} />
          </div>}
      </div>

      {/* Actions */}
      <div className="px-6 py-6 space-y-4">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
          <ActionButton icon={Play} label="Start Practice" description="Begin a new putting session" variant="primary" onClick={() => navigate('/new-session')} />
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }}>
          <ActionButton icon={History} label="View History" description="Review your past sessions" variant="secondary" onClick={() => navigate('/history')} />
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4
      }}>
          <ActionButton icon={BarChart3} label="Analysis" description="See your progress and trends" variant="secondary" onClick={() => navigate('/analysis')} />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;