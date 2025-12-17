
import { DockerService } from '../types';

export const generateYaml = (services: DockerService[]): string => {
  let yaml = `version: "3.8"\n\nservices:\n`;

  if (services.length === 0) {
    return yaml + `  # No services defined. Click "Add Service" to start.\n`;
  }

  services.forEach(service => {
    yaml += `  ${service.name || 'unnamed-service'}:\n`;
    
    // Build Block
    if (service.build && service.build.context) {
      yaml += `    build:\n`;
      yaml += `      context: ${service.build.context}\n`;
      if (service.build.dockerfile) {
        yaml += `      dockerfile: ${service.build.dockerfile}\n`;
      }
      if (service.build.target) {
        yaml += `      target: ${service.build.target}\n`;
      }
      if (service.build.args && service.build.args.length > 0) {
        yaml += `      args:\n`;
        service.build.args.forEach(a => {
           if (a.key) yaml += `        - ${a.key}=${a.value}\n`;
        });
      }
      // If build is present, image field acts as the tag for the built image
      if (service.image) {
        yaml += `    image: ${service.image}\n`;
      }
    } else {
       // Standard Image Block
       yaml += `    image: ${service.image || 'ubuntu:latest'}\n`;
    }
    
    if (service.command) {
      yaml += `    command: ${service.command}\n`;
    }

    if (service.restart && service.restart !== 'no') {
      yaml += `    restart: ${service.restart}\n`;
    }

    if (service.ports.length > 0) {
      yaml += `    ports:\n`;
      service.ports.forEach(p => {
        if (p.host && p.container) {
          yaml += `      - "${p.host}:${p.container}${p.protocol && p.protocol !== 'tcp' ? '/' + p.protocol : ''}"\n`;
        }
      });
    }

    if (service.environment.length > 0) {
      yaml += `    environment:\n`;
      service.environment.forEach(e => {
        if (e.key) {
          yaml += `      - ${e.key}=${e.value}\n`;
        }
      });
    }

    if (service.volumes.length > 0) {
      yaml += `    volumes:\n`;
      service.volumes.forEach(v => {
        if (v.source && v.target) {
          yaml += `      - ${v.source}:${v.target}\n`;
        }
      });
    }

    if (service.networks.length > 0) {
      yaml += `    networks:\n`;
      service.networks.forEach(n => {
        yaml += `      - ${n}\n`;
      });
    }
    
    if (service.dependsOn.length > 0) {
       yaml += `    depends_on:\n`;
       service.dependsOn.forEach(d => {
         yaml += `      - ${d}\n`;
       });
    }

    if (service.mem_limit) {
      yaml += `    deploy:\n      resources:\n        limits:\n          memory: ${service.mem_limit}\n`;
    }

    yaml += `\n`;
  });

  // Collect all unique networks
  const allNetworks = new Set<string>();
  services.forEach(s => s.networks.forEach(n => allNetworks.add(n)));

  if (allNetworks.size > 0) {
    yaml += `networks:\n`;
    allNetworks.forEach(n => {
      yaml += `  ${n}:\n    driver: bridge\n`;
    });
  }

  return yaml;
};
