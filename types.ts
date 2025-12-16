export interface EnvVar {
  id: string;
  key: string;
  value: string;
}

export interface PortMapping {
  id: string;
  host: string;
  container: string;
  protocol?: 'tcp' | 'udp';
}

export interface Volume {
  id: string;
  source: string;
  target: string;
  type?: 'bind' | 'volume';
}

export interface DockerService {
  id: string;
  name: string;
  image: string;
  command?: string;
  restart?: 'no' | 'always' | 'on-failure' | 'unless-stopped';
  ports: PortMapping[];
  volumes: Volume[];
  environment: EnvVar[];
  networks: string[];
  dependsOn: string[];
  cpu_shares?: number;
  mem_limit?: string;
}

export interface ComposeFile {
  version: string;
  services: DockerService[];
  networks?: string[];
  volumes?: string[];
}

export interface AnalysisResult {
  summary: string;
  security: string[];
  performance: string[];
  bestPractices: string[];
}

export type ViewMode = 'editor' | 'preview';