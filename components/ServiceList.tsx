import React from 'react';
import { DockerService } from '../types';
import { Box, Plus, Trash2, Cpu } from 'lucide-react';

interface ServiceListProps {
  services: DockerService[];
  activeServiceId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onMagicAdd: () => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  activeServiceId,
  onSelect,
  onAdd,
  onDelete,
  onMagicAdd
}) => {
  return (
    <div className="flex flex-col h-full bg-docker-panel border-r border-docker-border w-64 flex-shrink-0">
      <div className="p-4 border-b border-docker-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Services</h2>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{services.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={`group flex items-center justify-between p-3 rounded-md cursor-pointer transition-all ${
              activeServiceId === service.id
                ? 'bg-blue-600/10 border border-blue-500/50 text-blue-100'
                : 'bg-gray-800/50 border border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Box size={16} className={activeServiceId === service.id ? 'text-blue-400' : 'text-gray-500'} />
              <div className="flex flex-col overflow-hidden">
                <span className="truncate font-medium text-sm">{service.name}</span>
                <span className="truncate text-xs text-gray-500">{service.image}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(service.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
              title="Delete service"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        
        {services.length === 0 && (
          <div className="text-center py-8 px-4 text-gray-600 text-xs">
            No services defined. Add one manually or use AI generation.
          </div>
        )}
      </div>

      <div className="p-3 border-t border-docker-border space-y-2">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 rounded-md text-sm font-medium transition-colors border border-docker-border"
        >
          <Plus size={16} />
          Add Empty
        </button>
        <button
          onClick={onMagicAdd}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-2 rounded-md text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20"
        >
          <Cpu size={16} />
          Generate with AI
        </button>
      </div>
    </div>
  );
};