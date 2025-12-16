import React, { useState } from 'react';
import { FileInput, X, Loader2, ArrowRightLeft } from 'lucide-react';

interface MigrateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrate: (yaml: string) => Promise<void>;
  isProcessing: boolean;
}

export const MigrateModal: React.FC<MigrateModalProps> = ({ isOpen, onClose, onMigrate, isProcessing }) => {
  const [yamlInput, setYamlInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (yamlInput.trim()) {
      onMigrate(yamlInput);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
          <div className="flex items-center gap-2 text-blue-400">
            <ArrowRightLeft size={20} />
            <h2 className="font-semibold text-white">Import & Migrate</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-400 mb-4">
            Paste your existing <code>docker-compose.yml</code> file below. It will be analyzed, migrated to version 3.8 standards, and imported into the editor.
          </p>
          
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            className="w-full h-64 bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-gray-300 font-mono text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none mb-4 leading-relaxed custom-scrollbar"
            placeholder={`version: '2'\nservices:\n  web:\n    image: nginx\n    ports:\n     - "80:80"`}
            autoFocus
            spellCheck={false}
          />

          <div className="flex justify-end gap-3">
             <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-[#21262d] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!yamlInput.trim() || isProcessing}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-900/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRightLeft size={16} />
                  Migrate & Import
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};