import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiscCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function DiscCounter({ 
  value, 
  onChange, 
  min = 1, 
  max = 25,
  label = "Discs"
}: DiscCounterProps) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={value <= min}
          className="h-14 w-14 rounded-full border-2"
        >
          <Minus className="w-6 h-6" />
        </Button>
        
        <motion.div 
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 text-center"
        >
          <span className="font-display font-bold text-5xl text-foreground">
            {value}
          </span>
        </motion.div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={value >= max}
          className="h-14 w-14 rounded-full border-2"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
