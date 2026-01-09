import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  delay?: number;
}

export function StatCard({ icon: Icon, label, value, subtext, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-card rounded-lg p-4 card-elevated"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="font-display font-bold text-2xl text-foreground">{value}</p>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </motion.div>
  );
}
