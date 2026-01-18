import { motion } from 'framer-motion';
import { ChevronLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showHome?: boolean;
  rightContent?: React.ReactNode;
}

export function Header({ title, showBack = false, showHome = false, rightContent }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10"
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="font-display font-bold text-xl text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {rightContent && <div>{rightContent}</div>}
        {showHome && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <Home className="w-5 h-5" />
          </Button>
        )}
      </div>
    </motion.header>
  );
}
