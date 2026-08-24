import React, { useState } from 'react';
import { Cloud, Download, Upload, X, CheckCircle2, ShieldAlert, Mail } from 'lucide-react';
import type { UserProgress } from '../types/system';
import { syncToGoogleDrive } from '../utils/driveSync';
import { downloadProgressFile, importProgressFromJSON } from '../utils/storage';

interface DriveBackupModalProps {
  progress: UserProgress;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProgress: (updated: UserProgress) => void;
}

export const DriveBackupModal: React.FC<DriveBackupModalProps> = ({
  progress,
  isOpen,
  onClose,
  onUpdateProgress
}) => {
  const [email, setEmail] = useState<string>(progress.googleDriveEmail || '');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDriveSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Gmail address.' });
      return;
    }

    setIsSyncing(true);
    setStatusMessage(null);

    const result = await syncToGoogleDrive(email.trim(), progress);

    setIsSyncing(false);
    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      onUpdateProgress({
        ...progress,
        googleDriveEmail: email.trim(),
        lastDriveBackupDate: result.timestamp,
        isDriveSynced: true
      });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonStr = event.target?.result as string;
      if (jsonStr) {
        const imported = importProgressFromJSON(jsonStr);
        if (imported) {
          onUpdateProgress(imported);
          setStatusMessage({ type: 'success', text: 'Character save successfully restored!' });
        } else {
          setStatusMessage({ type: 'error', text: 'Failed to import save file. Invalid format.' });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-cyan-500/40 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Cloud className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100 font-display">
              GOOGLE DRIVE CLOUD SAVE
            </h3>
            <p className="text-xs text-slate-400">Sync your character stats & quest progress to Drive</p>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-3 rounded-lg text-xs mb-4 flex items-center space-x-2 font-mono ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/80 border border-red-500/40 text-red-300'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Email & Cloud Sync Form */}
        <form onSubmit={handleDriveSync} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1 flex items-center space-x-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>GMAIL ACCOUNT</span>
            </label>
            <input
              type="email"
              required
              placeholder="your.email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-cyan-400 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Your character progress is safely saved against your Google identity.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSyncing}
            className="w-full py-3 rounded-xl text-slate-950 bg-cyan-400 hover:bg-cyan-300 font-mono text-xs font-black tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Cloud className="w-4 h-4 fill-current" />
            <span>{isSyncing ? 'SYNCING TO GOOGLE DRIVE...' : 'SYNC NOW TO GOOGLE DRIVE'}</span>
          </button>
        </form>

        {progress.lastDriveBackupDate && (
          <div className="mt-3 text-center text-[10px] font-mono text-slate-400">
            LAST CLOUD BACKUP: {progress.lastDriveBackupDate}
          </div>
        )}

        {/* Export / Import File Section */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
          <span className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            MANUAL FILE BACKUP / RESTORE
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => downloadProgressFile(progress)}
              className="py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-mono flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPORT JSON</span>
            </button>

            <label className="py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-mono flex items-center justify-center space-x-1.5 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>IMPORT JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};
