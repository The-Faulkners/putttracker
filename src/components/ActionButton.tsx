import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  description: string;
  variant?: 'primary' | 'secondary' | 'muted';
  onClick: () => void;
}

export function ActionButton({ 
  icon: Icon, 
  label, 
  description, 
  variant = 'primary',
  onClick 
}: ActionButtonProps) {
  const variants = {
    primary: 'gradient-primary text-primary-foreground',
    secondary: 'bg-card text-card-foreground border border-border hover:border-primary/30',
    muted: 'bg-muted text-muted-foreground hover:bg-muted/80',
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full p-6 rounded-lg text-left transition-all duration-200 card-elevated',
        variants[variant]
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'p-3 rounded-lg',
          variant === 'primary' ? 'bg-primary-foreground/20' : 'bg-primary/10'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            variant === 'primary' ? 'text-primary-foreground' : 'text-primary'
          )} />
        </div>
        <div className="flex-1">
          <h3 className={cn(
            'font-display font-semibold text-lg mb-1',
            variant === 'primary' ? 'text-primary-foreground' : 'text-foreground'
          )}>
            {label}
          </h3>
          <p className={cn(
            'text-sm',
            variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}>
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
