import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PullToRefreshProps {
  pullDistance: number;
  threshold: number;
  isRefreshing: boolean;
}

export function PullToRefresh({ pullDistance, threshold, isRefreshing }: PullToRefreshProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
          style={{ paddingTop: Math.max(pullDistance, isRefreshing ? 60 : 0) }}
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="bg-primary rounded-full p-2 shadow-lg"
            style={{
              transform: `translateY(-50%) rotate(${progress * 180}deg)`,
            }}
          >
            <RefreshCw
              className={`w-5 h-5 text-primary-foreground ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
