import React from 'react';
import { X, Shield, Zap, BookOpen, Loader2, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
  isAnalyzing: boolean;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, result, isAnalyzing }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-[#30363d] w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
          <div className="flex items-center gap-2 text-indigo-400">
            <Shield size={20} />
            <h2 className="font-semibold text-white">Config Analysis</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-4">
              <Loader2 size={40} className="animate-spin text-indigo-500" />
              <p>Analyzing configuration with Gemini...</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              
              {/* Summary */}
              <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  "{result.summary}"
                </p>
              </div>

              {/* Security Section */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-red-400">
                  <Shield size={18} />
                  <h3 className="font-medium text-sm uppercase tracking-wider">Security</h3>
                </div>
                {result.security.length > 0 ? (
                  <ul className="space-y-2">
                    {result.security.map((item, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-gray-300 bg-red-500/5 p-3 rounded border border-red-500/10">
                        <span className="text-red-500 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 p-3 rounded border border-green-500/20">
                    <CheckCircle2 size={16} />
                    No critical security issues found.
                  </div>
                )}
              </div>

              {/* Performance Section */}
              <div>
                 <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <Zap size={18} />
                  <h3 className="font-medium text-sm uppercase tracking-wider">Performance</h3>
                </div>
                 <ul className="space-y-2">
                    {result.performance.length > 0 ? (
                      result.performance.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-gray-300 bg-amber-500/5 p-3 rounded border border-amber-500/10">
                          <span className="text-amber-500 mt-0.5">•</span>
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">No specific performance tweaks detected.</li>
                    )}
                  </ul>
              </div>

              {/* Best Practices Section */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-blue-400">
                  <BookOpen size={18} />
                  <h3 className="font-medium text-sm uppercase tracking-wider">Best Practices</h3>
                </div>
                <ul className="space-y-2">
                    {result.bestPractices.length > 0 ? (
                      result.bestPractices.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-gray-300 bg-blue-500/5 p-3 rounded border border-blue-500/10">
                          <span className="text-blue-500 mt-0.5">•</span>
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">Configuration looks good!</li>
                    )}
                  </ul>
              </div>

            </div>
          ) : (
             <div className="text-center text-gray-500">
                No results available.
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#30363d] bg-[#0d1117] flex justify-end">
           <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white transition-colors border border-gray-700"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};