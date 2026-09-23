'use client';

import React, { useEffect, useState } from 'react';
import { History, X, RotateCcw, Clock, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../lib/api';
import { DiagramRevisionDto } from '@nirmaanify/types';

interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagramId: string;
  onRestore: () => void;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  isOpen,
  onClose,
  diagramId,
  onRestore,
}) => {
  const [revisions, setRevisions] = useState<DiagramRevisionDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      apiClient.diagrams
        .listRevisions(diagramId)
        .then((revs) => setRevisions(revs))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, diagramId]);

  if (!isOpen) return null;

  const handleRestore = async (revisionId: string) => {
    setRestoringId(revisionId);
    try {
      await apiClient.diagrams.restoreRevision(diagramId, revisionId);
      onRestore();
      onClose();
    } catch (err) {
      console.error('Failed to restore revision:', err);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#635BFF]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Revision History
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading revisions...</div>
          ) : revisions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <Clock className="h-6 w-6 text-slate-300 dark:text-[#2E354F]" />
              <span>No saved checkpoint revisions yet. Click "Save" on the top bar to create a version snapshot.</span>
            </div>
          ) : (
            revisions.map((rev) => (
              <div
                key={rev.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50/50 dark:bg-[#141724]/50 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Version {rev.version}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={restoringId === rev.id}
                  onClick={() => handleRestore(rev.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF] hover:bg-white dark:hover:bg-[#1C2033] text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50"
                >
                  <RotateCcw className="h-3 w-3 text-[#635BFF]" />
                  <span>{restoringId === rev.id ? 'Restoring...' : 'Restore'}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
