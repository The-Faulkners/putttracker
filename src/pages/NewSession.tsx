import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Target, Play } from 'lucide-react';
import { Header } from '@/components/Header';
import { DiscCounter } from '@/components/DiscCounter';
import { Button } from '@/components/ui/button';
import { usePracticeData } from '@/hooks/usePracticeData';

export default function NewSession() {
  const navigate = useNavigate();
  const { settings, createSession } = usePracticeData();
  const [discsPerSet, setDiscsPerSet] = useState(settings.lastDiscsPerSet);

  const handleStart = () => {
    const session = createSession(discsPerSet);
    navigate(`/session/${session.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="New Session" showBack />
      
      <div className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Set Up Your Session
          </h2>
          <p className="text-muted-foreground">
            How many discs will you throw per set?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-8 card-elevated mb-8"
        >
          <DiscCounter
            value={discsPerSet}
            onChange={setDiscsPerSet}
            label="Discs per set"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={handleStart}
            className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Session
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
