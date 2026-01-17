import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

const SESSIONS_KEY = 'disc-golf-sessions';
const SETTINGS_KEY = 'disc-golf-settings';

export function DataManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const sessions = localStorage.getItem(SESSIONS_KEY);
      const settings = localStorage.getItem(SETTINGS_KEY);
      
      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        sessions: sessions ? JSON.parse(sessions) : [],
        settings: settings ? JSON.parse(settings) : {},
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `putt-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data exported',
        description: 'Your practice data has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export your data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // Validate the import data structure
        if (!importData.sessions || !Array.isArray(importData.sessions)) {
          throw new Error('Invalid backup file format');
        }

        // Store the imported data
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(importData.sessions));
        if (importData.settings) {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(importData.settings));
        }

        toast({
          title: 'Data imported',
          description: `Successfully imported ${importData.sessions.length} session(s).`,
        });

        // Reload to reflect the new data
        window.location.reload();
      } catch (error) {
        toast({
          title: 'Import failed',
          description: 'The file is not a valid Putt Tracker backup.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="flex-1"
      >
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="flex-1"
      >
        <Upload className="w-4 h-4 mr-2" />
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
