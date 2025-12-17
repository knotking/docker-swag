import React, { useState } from 'react';
import { DockerService, EnvVar, PortMapping, Volume } from '../types';
import { Trash2, Plus, Info, Link } from 'lucide-react';

interface ServiceEditorProps {
  service: DockerService;
  onChange: (updated: DockerService) => void;
  allServiceNames: string[];
}

const InputGroup = ({ label, children, helper }: { label: string; children?: React.ReactNode; helper?: string }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
    {children}
    {helper && <p className="text-xs text-gray-600 mt-1">{helper}</p>}
  </div>
);

const SectionHeader = ({ title, icon }: { title: string, icon?: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-4 mt-8 pb-2 border-b border-gray-800 text-blue-400">
    {icon}
    <h3 className="text-sm font-semibold">{title}</h3>
  </div>
);

export const ServiceEditor: React.FC<ServiceEditorProps> = ({ service, onChange, allServiceNames }) => {
  const handleChange = (field: keyof DockerService, value: any) => {
    onChange({ ...service, [field]: value });
  };

  // --- Helpers for Arrays (Ports, Envs, Vols) ---
  const addPort = () => {
    const newPort: PortMapping = { id: Math.random().toString(), host: '8080', container: '80' };
    handleChange('ports', [...service.ports, newPort]);
  };
  const removePort = (id: string) => {
    handleChange('ports', service.ports.filter(p => p.id !== id));
  };
  const updatePort = (id: string, field: keyof PortMapping, value: string) => {
    handleChange('ports', service.ports.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addEnv = () => {
    const newEnv: EnvVar = { id: Math.random().toString(), key: 'NEW_VAR', value: 'value' };
    handleChange('environment', [...service.environment, newEnv]);
  };
  const removeEnv = (id: string) => {
    handleChange('environment', service.environment.filter(e => e.id !== id));
  };
  const updateEnv = (id: string, field: keyof EnvVar, value: string) => {
    handleChange('environment', service.environment.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addVol = () => {
    const newVol: Volume = { id: Math.random().toString(), source: './data', target: '/data' };
    handleChange('volumes', [...service.volumes, newVol]);
  };
  const removeVol = (id: string) => {
    handleChange('volumes', service.volumes.filter(v => v.id !== id));
  };
  const updateVol = (id: string, field: keyof Volume, value: string) => {
    handleChange('volumes', service.volumes.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  // Filter out the current service from potential dependencies
  const otherServices = allServiceNames.filter(name => name !== service.name);

  const toggleDependency = (targetName: string) => {
    const currentDepends = service.dependsOn || [];
    if (currentDepends.includes(targetName)) {
      handleChange('dependsOn', currentDepends.filter(d => d !== targetName));
    } else {
      handleChange('dependsOn', [...currentDepends, targetName]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-docker-dark p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{service.name}</h1>
          <p className="text-gray-500 text-sm">Configure your container settings below.</p>
        </div>

        {/* General Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="Service Name">
            <input
              type="text"
              value={service.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-docker-panel border border-docker-border rounded p-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="e.g. web-app"
            />
          </InputGroup>
          <InputGroup label="Image">
            <input
              type="text"
              value={service.image}
              onChange={(e) => handleChange('image', e.target.value)}
              className="w-full bg-docker-panel border border-docker-border rounded p-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="e.g. node:18-alpine"
            />
          </InputGroup>
          <InputGroup label="Restart Policy">
            <select
              value={service.restart || 'no'}
              onChange={(e) => handleChange('restart', e.target.value)}
              className="w-full bg-docker-panel border border-docker-border rounded p-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="no">no</option>
              <option value="always">always</option>
              <option value="on-failure">on-failure</option>
              <option value="unless-stopped">unless-stopped</option>
            </select>
          </InputGroup>
          <InputGroup label="Memory Limit (Optional)">
             <input
              type="text"
              value={service.mem_limit || ''}
              onChange={(e) => handleChange('mem_limit', e.target.value)}
              className="w-full bg-docker-panel border border-docker-border rounded p-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="e.g. 512m"
            />
          </InputGroup>
        </div>
        
        <InputGroup label="Command (Optional)">
          <input
            type="text"
            value={service.command || ''}
            onChange={(e) => handleChange('command', e.target.value)}
            className="w-full bg-docker-panel border border-docker-border rounded p-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors font-mono"
            placeholder="npm start"
          />
        </InputGroup>

        {/* Ports */}
        <SectionHeader title="Port Mapping" />
        <div className="space-y-2 mb-4">
          {service.ports.map((port) => (
            <div key={port.id} className="flex items-center gap-2">
              <input
                type="text"
                value={port.host}
                onChange={(e) => updatePort(port.id, 'host', e.target.value)}
                className="w-24 bg-docker-panel border border-docker-border rounded p-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                placeholder="Host"
              />
              <span className="text-gray-500">:</span>
              <input
                type="text"
                value={port.container}
                onChange={(e) => updatePort(port.id, 'container', e.target.value)}
                className="w-24 bg-docker-panel border border-docker-border rounded p-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                placeholder="Container"
              />
              <button onClick={() => removePort(port.id)} className="p-2 text-gray-500 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button onClick={addPort} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium">
            <Plus size={14} /> Add Port
          </button>
        </div>

        {/* Environment Variables */}
        <SectionHeader title="Environment Variables" />
        <div className="space-y-2 mb-4">
          {service.environment.map((env) => (
            <div key={env.id} className="flex items-center gap-2">
              <input
                type="text"
                value={env.key}
                onChange={(e) => updateEnv(env.id, 'key', e.target.value)}
                className="flex-1 bg-docker-panel border border-docker-border rounded p-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                placeholder="KEY"
              />
              <span className="text-gray-500">=</span>
              <input
                type="text"
                value={env.value}
                onChange={(e) => updateEnv(env.id, 'value', e.target.value)}
                className="flex-1 bg-docker-panel border border-docker-border rounded p-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                placeholder="VALUE"
              />
              <button onClick={() => removeEnv(env.id)} className="p-2 text-gray-500 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button onClick={addEnv} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium">
            <Plus size={14} /> Add Variable
          </button>
        </div>

        {/* Volumes */}
        <SectionHeader title="Volumes" />
        <div className="space-y-2 mb-4">
           {service.volumes.map((vol) => (
            <div key={vol.id} className="flex items-center gap-2">
              <input
                type="text"
                value={vol.source}
                onChange={(e) => updateVol(vol.id, 'source', e.target.value)}
                className="flex-1 bg-docker-panel border border-docker-border rounded p-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                placeholder="./host/path"
              />
              <span className="text-gray-500">:</span>
              <input
                type="text"
                value={vol.target}
                onChange={(e) => updateVol(vol.id, 'target', e.target.value)}
                className="flex-1 bg-docker-panel border border-docker-border rounded p-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                placeholder="/container/path"
              />
              <button onClick={() => removeVol(vol.id)} className="p-2 text-gray-500 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
           <button onClick={addVol} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium">
            <Plus size={14} /> Add Volume
          </button>
        </div>

        {/* Depends On */}
        <SectionHeader title="Depends On" icon={<Link size={16} />} />
        {otherServices.length === 0 ? (
          <p className="text-xs text-gray-500 italic mb-4">
            No other services available. Add more services to configure dependencies.
          </p>
        ) : (
          <div className="space-y-2 mb-4 bg-docker-panel border border-docker-border rounded-lg p-3">
             {otherServices.map(other => {
               const isChecked = (service.dependsOn || []).includes(other);
               return (
                <label key={other} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors group">
                   <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-gray-600 group-hover:border-gray-500'}`}>
                      {isChecked && <Plus size={10} className="text-white transform rotate-45" />}
                   </div>
                   <input
                     type="checkbox"
                     checked={isChecked}
                     onChange={() => toggleDependency(other)}
                     className="hidden"
                   />
                   <span className={`text-sm ${isChecked ? 'text-white' : 'text-gray-400'}`}>{other}</span>
                </label>
               );
             })}
          </div>
        )}
      </div>
    </div>
  );
};