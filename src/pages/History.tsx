import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, Clock, Trash2, Pencil, Check, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { usePracticeData } from '@/hooks/usePracticeData';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PracticeSet } from '@/types/practice';
import { PuttResultsIndicator } from '@/components/PuttResultsIndicator';

export default function History() {
  const { getCompletedSessions, deleteSession, updateSet } = usePracticeData();
  const [sessions, setSessions] = useState(() => getCompletedSessions());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<PracticeSet | null>(null);
  const [editScored, setEditScored] = useState(0);
  const [editThrown, setEditThrown] = useState(0);

  const refreshSessions = () => setSessions(getCompletedSessions());

  const getSessionStats = (session: typeof sessions[0]) => {
    const totalThrown = session.sets.reduce((acc, s) => acc + s.discsThrown, 0);
    const totalScored = session.sets.reduce((acc, s) => acc + s.discsScored, 0);
    const accuracy = totalThrown > 0 ? (totalScored / totalThrown) * 100 : 0;
    
    const duration = session.endTime 
      ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
      : 0;
    
    return { totalThrown, totalScored, accuracy, duration };
  };

  const handleDeleteSession = () => {
    if (deleteConfirmId) {
      deleteSession(deleteConfirmId);
      refreshSessions();
      setDeleteConfirmId(null);
    }
  };

  const handleEditSet = (sessionId: string, set: PracticeSet) => {
    setEditingSession(sessionId);
    setEditingSet(set);
    setEditScored(set.discsScored);
    setEditThrown(set.discsThrown);
  };

  const handleSaveSet = () => {
    if (editingSession && editingSet) {
      updateSet(editingSession, editingSet.id, editScored, editThrown);
      refreshSessions();
      setEditingSession(null);
      setEditingSet(null);
    }
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
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="font-display font-bold text-2xl text-primary">
                          {stats.accuracy.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">accuracy</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteConfirmId(session.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                      {session.sets.length} sets - tap to edit
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {session.sets.map((set) => {
                        const setAccuracy = (set.discsScored / set.discsThrown) * 100;
                        const hasPuttResults = set.puttResults && set.puttResults.length > 0;
                        return (
                          <button
                            key={set.id}
                            onClick={() => handleEditSet(session.id, set)}
                            className={`min-w-10 rounded flex flex-col items-center justify-center text-xs font-medium transition-all hover:ring-2 hover:ring-primary p-2 ${
                              setAccuracy >= 80 
                                ? 'bg-success/20 text-success' 
                                : setAccuracy >= 60 
                                ? 'bg-accent/20 text-accent-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <span className="font-bold">{set.discsScored}</span>
                              <span className="text-[10px] opacity-70">/{set.discsThrown}</span>
                            </div>
                            {hasPuttResults && (
                              <PuttResultsIndicator results={set.puttResults!} size="sm" />
                            )}
                          </button>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this practice session and all its sets. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Set Dialog */}
      <Dialog open={!!editingSet} onOpenChange={() => setEditingSet(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Set</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Discs Made</label>
              <Input
                type="number"
                min={0}
                max={editThrown}
                value={editScored}
                onChange={(e) => setEditScored(Math.min(Number(e.target.value), editThrown))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Total Discs</label>
              <Input
                type="number"
                min={1}
                value={editThrown}
                onChange={(e) => {
                  const newThrown = Math.max(1, Number(e.target.value));
                  setEditThrown(newThrown);
                  if (editScored > newThrown) setEditScored(newThrown);
                }}
              />
            </div>
            <div className="text-center text-lg font-semibold text-primary">
              {editThrown > 0 ? ((editScored / editThrown) * 100).toFixed(0) : 0}% accuracy
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setEditingSet(null)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSaveSet}>
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
