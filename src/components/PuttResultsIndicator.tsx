import { PuttResult } from '@/types/practice';
import { cn } from '@/lib/utils';

interface PuttResultsIndicatorProps {
  results: PuttResult[];
  size?: 'sm' | 'md';
  className?: string;
}

export function PuttResultsIndicator({ results, size = 'sm', className }: PuttResultsIndicatorProps) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  
  if (!results || results.length === 0) return null;
  
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {results.map((result, index) => (
        <div
          key={index}
          className={cn(
            'rounded-full transition-all',
            dotSize,
            result === 'made'
              ? 'bg-success'
              : 'border-2 border-destructive bg-transparent'
          )}
        />
      ))}
    </div>
  );
}
