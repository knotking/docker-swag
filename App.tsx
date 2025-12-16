import React, { useState, useEffect, useCallback } from 'react';
import { ServiceList } from './components/ServiceList';
import { ServiceEditor } from './components/ServiceEditor';
import { MagicModal } from './components/MagicModal';
import { AnalysisModal } from './components/AnalysisModal';
import { MigrateModal } from './components/MigrateModal';
import { generateYaml } from './utils/yamlGenerator';
import { DockerService, AnalysisResult } from './types';
import { generateServiceFromPrompt, analyzeComposeConfig, parseAndMigrateYaml } from './services/geminiService';
import { Download, Code, Eye, AlertCircle, ShieldCheck, Undo2, Redo2, Import } from 'lucide-react';

const INITIAL_SERVICE: DockerService = {
  id: '1',
  name: 'web',
  image: 'nginx:latest',
  ports: [{ id: 'p1', host: '80', container: '80', protocol: 'tcp' }],
  environment: [],
  volumes: [],
  networks: [],
  dependsOn: [],
  restart: 'always'
};

export default function App() {
  // History State
  const [history, setHistory] = useState<DockerService[][]>([[INITIAL_SERVICE]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [services, setServices] = useState<DockerService[]>([INITIAL_SERVICE]);
  const [activeServiceId, setActiveServiceId] = useState<string | null>('1');
  const [showPreview, setShowPreview] = useState(true);
  
  // Magic Generation State
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Analysis State
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Migrate State
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeService = services.find(s => s.id === activeServiceId);

  // Auto-hide error after 5s
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // --- History Actions ---
  const updateServicesWithHistory = (newServices: DockerService[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newServices);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setServices(newServices);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setServices(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setServices(history[newIndex]);
    }
  };

  // Keyboard shortcut for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]); // Dependencies needed for closures


  const handleServiceChange = (updatedService: DockerService) => {
    const newServices = services.map(s => s.id === updatedService.id ? updatedService : s);
    updateServicesWithHistory(newServices);
  };

  const handleAddService = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const newService: DockerService = {
      id,
      name: `service-${services.length + 1}`,
      image: 'alpine:latest',
      ports: [],
      environment: [],
      volumes: [],
      networks: [],
      dependsOn: []
    };
    const newServices = [...services, newService];
    updateServicesWithHistory(newServices);
    setActiveServiceId(id);
  };

  const handleDeleteService = (id: string) => {
    const newServices = services.filter(s => s.id !== id);
    updateServicesWithHistory(newServices);
    if (activeServiceId === id) {
      setActiveServiceId(newServices.length > 0 ? newServices[0].id : null);
    }
  };

  const handleMagicGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const newService = await generateServiceFromPrompt(prompt);
      // Ensure name uniqueness
      let uniqueName = newService.name;
      let counter = 1;
      while (services.some(s => s.name === uniqueName)) {
        uniqueName = `${newService.name}-${counter}`;
        counter++;
      }
      newService.name = uniqueName;
      
      const newServices = [...services, newService];
      updateServicesWithHistory(newServices);
      setActiveServiceId(newService.id);
      setIsMagicModalOpen(false);
    } catch (error) {
      setErrorMsg("Failed to generate service. Please try again or check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalysisModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const yaml = generateYaml(services);
      const result = await analyzeComposeConfig(yaml);
      setAnalysisResult(result);
    } catch (error) {
       setErrorMsg("Analysis failed. Please try again.");
       setIsAnalysisModalOpen(false); // Close if it fails immediately so they see error toast
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMigrate = async (yamlInput: string) => {
    setIsMigrating(true);
    setErrorMsg(null);
    try {
      const migratedServices = await parseAndMigrateYaml(yamlInput);
      if (migratedServices.length === 0) {
        throw new Error("No services found in input.");
      }
      updateServicesWithHistory(migratedServices);
      setActiveServiceId(migratedServices[0].id);
      setIsMigrateModalOpen(false);
    } catch (error) {
      console.error(error);
      setErrorMsg("Migration failed. Ensure the YAML is valid.");
    } finally {
      setIsMigrating(false);
    }
  };

  const downloadYaml = () => {
    const yaml = generateYaml(services);
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const yamlContent = generateYaml(services);

  return (
    <div className="flex h-screen bg-docker-dark text-gray-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <ServiceList
        services={services}
        activeServiceId={activeServiceId}
        onSelect={setActiveServiceId}
        onAdd={handleAddService}
        onDelete={handleDeleteService}
        onMagicAdd={() => setIsMagicModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-docker-border bg-docker-panel flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">DockerSwag</h1>
          </div>
          
          <div className="flex items-center gap-3">
             {/* History Controls */}
             <div className="flex items-center gap-1 mr-2 bg-gray-800/50 rounded-md p-1 border border-docker-border">
                <button
                  onClick={undo}
                  disabled={historyIndex === 0}
                  className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={16} />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex === history.length - 1}
                  className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo2 size={16} />
                </button>
             </div>

             <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-md transition-colors ${showPreview ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              title="Toggle Split View"
            >
              {showPreview ? <Eye size={18} /> : <Code size={18} />}
            </button>
            <div className="h-6 w-px bg-gray-700 mx-1"></div>
            
            <button
              onClick={() => setIsMigrateModalOpen(true)}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-1.5 rounded-md text-sm font-medium transition-colors border border-gray-600"
            >
              <Import size={16} />
              Import
            </button>

            <button
              onClick={handleAnalyze}
              className="flex items-center gap-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <ShieldCheck size={16} />
              Analyze
            </button>

            <button
              onClick={downloadYaml}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </header>

        {/* Editor & Preview Split */}
        <div className="flex-1 flex overflow-hidden relative">
          {errorMsg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 text-sm backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {activeService ? (
            <ServiceEditor
              service={activeService}
              onChange={handleServiceChange}
              allServiceNames={services.map(s => s.name)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-docker-dark">
              <Code size={48} className="mb-4 opacity-20" />
              <p>Select a service to edit or create a new one.</p>
            </div>
          )}

          {/* Live Preview Panel */}
          {showPreview && (
            <div className="w-[450px] bg-[#0d1117] border-l border-docker-border flex flex-col shadow-xl">
              <div className="px-4 py-2 bg-[#161b22] border-b border-docker-border flex justify-between items-center">
                <span className="text-xs font-mono text-gray-400">docker-compose.yml</span>
                <span className="text-[10px] uppercase text-gray-600 font-bold tracking-wider">Read Only</span>
              </div>
              <pre className="flex-1 p-4 overflow-auto text-sm font-mono text-gray-300 leading-relaxed custom-scrollbar">
                {yamlContent}
              </pre>
            </div>
          )}
        </div>
      </div>

      <MagicModal
        isOpen={isMagicModalOpen}
        onClose={() => setIsMagicModalOpen(false)}
        onGenerate={handleMagicGenerate}
        isGenerating={isGenerating}
      />

      <AnalysisModal 
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        result={analysisResult}
        isAnalyzing={isAnalyzing}
      />

      <MigrateModal
        isOpen={isMigrateModalOpen}
        onClose={() => setIsMigrateModalOpen(false)}
        onMigrate={handleMigrate}
        isProcessing={isMigrating}
      />
    </div>
  );
}