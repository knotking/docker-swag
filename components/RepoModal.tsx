import React, { useState } from 'react';
import { GitBranch, X, Loader2, Github } from 'lucide-react';

interface RepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (repoUrl: string, hint: string) => Promise<void>;
  isGenerating: boolean;
}

export const RepoModal: React.FC<RepoModalProps> = ({ isOpen, onClose, onGenerate, isGenerating }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [hint, setHint] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onGenerate(repoUrl, hint);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
          <div className="flex items-center gap-2 text-green-400">
            <Github size={20} />
            <h2 className="font-semibold text-white">Repo to Compose</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-400 mb-4">
            Enter a repository URL. The AI will generate a likely Docker Compose configuration based on the project type.
          </p>
          
          <div className="mb-4">
             <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Repository URL</label>
             <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none placeholder-gray-600"
                placeholder="https://github.com/username/project"
                required
                autoFocus
              />
          </div>

          <div className="mb-6">
             <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Tech Stack / Hint (Optional)</label>
             <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none placeholder-gray-600"
                placeholder="e.g. Node.js with MongoDB, or Python Flask"
              />
          </div>

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
              disabled={!repoUrl.trim() || isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-900/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <GitBranch size={16} />
                  Generate Stack
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};